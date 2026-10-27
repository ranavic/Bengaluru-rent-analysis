import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.data_service import data_service
from services.rent_estimator import rent_estimator
from services.fairness_service import fairness_service
from services.comparison_service import comparison_service

class TestBengaluruRentalServices(unittest.TestCase):
    def test_data_loading(self):
        df = data_service.get_all_properties()
        metro = data_service.get_all_metro_stations()
        self.assertGreater(len(df), 500, "Should load at least 500 properties")
        self.assertGreater(len(metro), 40, "Should load metro stations")
        self.assertTrue("rent_per_sqft" in df.columns)

    def test_rent_estimator(self):
        df = data_service.get_all_properties()
        sample = df.iloc[0]
        expected_rent, breakdown = rent_estimator.estimate_expected_rent(sample, df)
        self.assertGreater(expected_rent, 5000, "Expected rent should be reasonable")
        self.assertIn("baseline_sqft_rate", breakdown)
        self.assertIn("confidence_level", breakdown)

    def test_fairness_service(self):
        df = data_service.get_all_properties()
        sample = df.iloc[0]
        result = fairness_service.evaluate_property(sample, df)
        self.assertIn("fairness_score", result)
        self.assertIn("price_category", result)
        self.assertIn("premium_pct", result)
        self.assertIn(result["price_category"], ["Below Benchmark", "Near Benchmark", "Above Benchmark"])
        self.assertGreaterEqual(result["fairness_score"], 0)
        self.assertLessEqual(result["fairness_score"], 100)

    def test_comparison_service(self):
        df = data_service.get_all_properties()
        ids = df["property_id"].head(2).tolist()
        res = comparison_service.compare_properties(ids)
        self.assertEqual(len(res["properties"]), 2)
        self.assertTrue(res["best_value_property_id"] in ids)
        self.assertTrue(len(res["recommendation_summary"]) > 10)

if __name__ == "__main__":
    unittest.main()
