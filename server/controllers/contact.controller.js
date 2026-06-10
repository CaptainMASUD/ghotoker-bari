import mongoose from "mongoose";
import Contact from "../models/contact.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

const allowedTopics = [
  "Profile verification",
  "Premium membership",
  "Matchmaking & concierge",
  "Report an issue",
  "Partnerships",
  "Other",
];

const allowedChannels = ["Email", "Phone", "WhatsApp"];

/* =====================================================
   PUBLIC: CREATE CONTACT
   Anyone can send contact message
===================================================== */

export const createContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone = "",
      topic,
      channel = "Email",
      message,
      consent,
    } = req.body;

    const errors = {};

    if (!name || String(name).trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      errors.email = "Valid email is required.";
    }

    if (phone && !/^[0-9+()\-.\s]{7,30}$/.test(String(phone).trim())) {
      errors.phone = "Valid phone number is required.";
    }

    if (!topic || !allowedTopics.includes(topic)) {
      errors.topic = "Valid topic is required.";
    }

    if (!allowedChannels.includes(channel)) {
      errors.channel = "Valid preferred channel is required.";
    }

    if (!message || String(message).trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    if (String(message || "").length > 3000) {
      errors.message = "Message cannot be more than 3000 characters.";
    }

    if (consent !== true) {
      errors.consent = "Privacy policy consent is required.";
    }

    if (Object.keys(errors).length) {
      return sendError(res, 400, "Validation failed.", errors);
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      topic,
      channel,
      message,
      consent,
    });

    return sendSuccess(res, 201, "Contact message sent successfully.", {
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        topic: contact.topic,
        channel: contact.channel,
        message: contact.message,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    return sendError(res, 500, "Failed to send contact message.");
  }
};

/* =====================================================
   ADMIN: GET ALL CONTACTS
   Cursor pagination + search + filters
===================================================== */

export const getContactsForAdmin = async (req, res) => {
  try {
    const {
      q = "",
      topic,
      channel,
      cursor,
      limit = 20,
    } = req.query;

    const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {
      is_deleted: false,
    };

    if (topic && allowedTopics.includes(topic)) {
      filter.topic = topic;
    }

    if (channel && allowedChannels.includes(channel)) {
      filter.channel = channel;
    }

    if (cursor && isValidObjectId(cursor)) {
      filter._id = { $lt: cursor };
    }

    const search = String(q || "").trim().toLowerCase();

    if (search) {
      const safe = escapeRegex(search);

      filter.$or = [
        { name_normalized: { $regex: safe, $options: "i" } },
        { email_normalized: { $regex: safe, $options: "i" } },
        { phone_normalized: { $regex: safe, $options: "i" } },
        { topic: { $regex: safe, $options: "i" } },
        { message: { $regex: safe, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ _id: -1 })
      .limit(pageLimit + 1)
      .lean();

    const hasMore = contacts.length > pageLimit;
    const items = hasMore ? contacts.slice(0, pageLimit) : contacts;
    const nextCursor = hasMore ? items[items.length - 1]?._id : null;

    return sendSuccess(res, 200, "Contacts fetched successfully.", {
      contacts: items,
      pagination: {
        limit: pageLimit,
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return sendError(res, 500, "Failed to fetch contacts.");
  }
};

/* =====================================================
   ADMIN: GET SINGLE CONTACT
===================================================== */

export const getContactByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid contact id.");
    }

    const contact = await Contact.findOne({
      _id: id,
      is_deleted: false,
    }).lean();

    if (!contact) {
      return sendError(res, 404, "Contact not found.");
    }

    return sendSuccess(res, 200, "Contact fetched successfully.", {
      contact,
    });
  } catch (error) {
    console.error("Get contact by id error:", error);
    return sendError(res, 500, "Failed to fetch contact.");
  }
};

/* =====================================================
   ADMIN: DELETE CONTACT
   Soft delete
===================================================== */

export const deleteContactByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid contact id.");
    }

    const contact = await Contact.findOneAndUpdate(
      {
        _id: id,
        is_deleted: false,
      },
      {
        $set: {
          is_deleted: true,
          deleted_by: req.user?._id || null,
          deleted_at: new Date(),
        },
      },
      {
        new: true,
      }
    ).select("_id is_deleted deleted_at");

    if (!contact) {
      return sendError(res, 404, "Contact not found.");
    }

    return sendSuccess(res, 200, "Contact deleted successfully.", {
      contact,
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return sendError(res, 500, "Failed to delete contact.");
  }
};

/* =====================================================
   ADMIN: CONTACT STATS
===================================================== */

export const getContactStatsForAdmin = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [total, today] = await Promise.all([
      Contact.countDocuments({ is_deleted: false }),
      Contact.countDocuments({
        is_deleted: false,
        createdAt: { $gte: startOfToday },
      }),
    ]);

    return sendSuccess(res, 200, "Contact stats fetched successfully.", {
      stats: {
        total,
        today,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    return sendError(res, 500, "Failed to fetch contact stats.");
  }
};