import unittest

from app.live_search import _is_official


class OfficialDomainTests(unittest.TestCase):
    def test_gov_domains_are_official(self):
        self.assertTrue(_is_official("https://ssc.gov.in/"))
        self.assertTrue(_is_official("https://upprpb.gov.in/notice"))

    def test_nic_domains_are_official(self):
        self.assertTrue(_is_official("https://recruitment.nic.in/"))

    def test_non_official_domains_are_not(self):
        self.assertFalse(_is_official("https://example.gov.in.fake.test/"))
        self.assertFalse(_is_official("https://jobs-example.com/"))


if __name__ == "__main__":
    unittest.main()
