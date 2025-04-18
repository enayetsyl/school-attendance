// src/controllers/student.controller.ts
import { RequestHandler } from 'express';
import { Student } from '../models/student.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { sendResponse } from '../utils/sendResponse';

export const createStudent: RequestHandler = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  sendResponse({ res, statusCode: 201, message: 'Student created', data: student });
});

export const getStudents: RequestHandler = asyncHandler(
  async (req, res) => {
    // 1) parse paging params
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) build filter
    const filter: any = { status: 'active' };
    if (req.query.class) filter.currentClass = Number(req.query.class);
    if (req.query.section) filter.currentSection = req.query.section;

    // 3) fetch both the slice and the total count
    const [items, total] = await Promise.all([
      Student.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    // 4) send back items + meta
    sendResponse({
      res,
      data: items,
      meta: { page, pageSize: limit, total },
    });
  }
);

export const getStudent: RequestHandler = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Student not found',
    });
    return;
  }

  if (student.status === 'inactive') {
    sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Student is inactive',
    });
    return;
  }

  sendResponse({ res, data: student });
});

export const updateStudent: RequestHandler = asyncHandler(async (req, res) => {
  const existing = await Student.findById(req.params.id);
  if (!existing || existing.status === 'inactive') {
    sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Student not found or inactive',
    });
    return;
  }

  const updated = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  sendResponse({ res, message: 'Student updated', data: updated });
});

export const deleteStudent: RequestHandler = asyncHandler(async (req, res) => {
  const existing = await Student.findById(req.params.id);
  if (!existing || existing.status === 'inactive') {
    sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Student not found or already inactive',
    });
    return;
  }

  await Student.findByIdAndUpdate(
    req.params.id,
    { status: 'inactive' },
    { new: true }
  );
  sendResponse({ res, message: 'Student marked inactive' });
});
