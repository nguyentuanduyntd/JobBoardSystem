from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from companies.models import Company
class CompanyModelTest(TestCase):

    def setUp(self):
        self.company = Company.objects.create(
            name="Tech Corp",
            description="A great tech company",
            location="Ho Chi Minh City",
            website="https://techcorp.com",
        )
    # ✅ Test __str__
    def test_str_returns_name(self):
        self.assertEqual(str(self.company), "Tech Corp")
    # ✅ Test website có thể null/blank
    def test_website_can_be_null(self):
        company = Company.objects.create(
            name="No Website Corp",
            description="desc",
            location="Hanoi",
        )
        self.assertIsNone(company.website)

    # ✅ Test upload logo
    def test_logo_upload(self):
        fake_image = SimpleUploadedFile(
            name="logo.png",
            content=b"\x89PNG\r\n\x1a\n" + b"\x00" * 100,  # fake PNG bytes
            content_type="image/png",
        )
        company = Company.objects.create(
            name="Logo Corp",
            description="desc",
            location="Hanoi",
            logo=fake_image,
        )
        self.assertTrue(company.logo.name.startswith("jobboard/companies/"))

    # ✅ Test các field lưu đúng giá trị
    def test_fields_saved_correctly(self):
        self.assertEqual(self.company.name, "Tech Corp")
        self.assertEqual(self.company.description, "A great tech company")
        self.assertEqual(self.company.location, "Ho Chi Minh City")
        self.assertEqual(self.company.website, "https://techcorp.com")