const request = require("supertest");
const app = require("../index"); // Assuming your Express app is exported from 'index.js'
const mongoose = require("mongoose");
const Category = require("../models/category.model");
require('dotenv').config()

const URI = process.env.MONGODB_URI;

// Mocking MongoDB connection
beforeAll(async () => {
  await mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
});

// Clearing the database before each test
beforeEach(async () => {
  await Category.deleteMany({});
});

// Close MongoDB connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Category Routes", () => {
  describe("/api/v1/categories/create", () => {
    it("should create a new category", async () => {
      const res = await request(app)  
        .post("/api/v1/categories/create")
        .send({ categoryName: "Test Category", description: "Test Description" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Category created successfully");
      expect(res.body.categoryCreated).toHaveProperty("_id");
    });
  });

  describe("/api/v1/categories", () => {
    it("should fetch all categories", async () => {
      await Category.create({ categoryName: "Test Category", description: "Test Description" });

      const res = await request(app).get("/api/v1/categories");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Category fetched successfully");
      expect(res.body.categories).toBeTruthy();
      expect(res.body.categories.length).toBe(1);
    });
  });

});
