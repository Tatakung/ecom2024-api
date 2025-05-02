const { deserializeRawResult } = require("@prisma/client/runtime/library");
const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error555",
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const product = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: {
        createdAt: "asc",
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      return res.status(400).json({
        message: "ไม่พบสิง่ที่จะลบอะ ",
      });
    }

    //ลบใน cluld
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id); // รอทีละรูป
    }

 

    // ลบตัวสินค้า
    const deletedProduct = await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });



    res.json(deletedProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    // ลบรูปทิ้ง
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });
    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    console.log(sort, order, limit);
    const products = await prisma.product.findMany({
      take: parseInt(limit),
      orderBy: {
        [sort]: order,
      },
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};

const handQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    return res.json(products);
  } catch (error) {
    res.json({
      message: "Server Error",
    });
  }
};

const handPrice = async (req, res, priceRange) => {
  // console.log("ส่งมาคือ",priceRange)
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.json({
      message: "Server Error",
    });
  }
};

const handcategory = async (req, res, category) => {
  console.log(category);
  const news = category.map((item) => {
    return Number(item);
  });
  const products = await prisma.product.findMany({
    where: {
      categoryId: {
        in: news,
      },
    },
    include: {
      category: true,
    },
  });
  res.json(products);
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;
    console.log(query, category, price);
    if (query) {
      await handQuery(req, res, query);
    }
    if (category) {
      await handcategory(req, res, category);
    }
    if (price) {
      await handPrice(req, res, price);
      console.log(price)
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.createi = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: "roitai-" + Date.now(),
      resource_type: "auto",
      folder: "Ecome2025",
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.removeImages = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.json({
        message: "ลบสำเร็จ",
      });
    });
  } catch (error) {
    console.log(error);
    res.statusa(500).json({
      message: "Server Error",
    });
  }
};
