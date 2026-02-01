import prisma from "../config/prisma.js";

export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true
    }
  });

  return res.json({
    success: true,
    data: user
  });
};
