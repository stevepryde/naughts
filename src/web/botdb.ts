import express = require("express");
import Joi = require("joi");
import fs from "fs";

import db from "./db";

const router = express.Router();


router.post("/add", async function(req, res) {
  if (req.body.p !== "thisisareallybadidea") {
    // Request timeout.
    return;
  }

  const schema = Joi.object().keys({
    name: Joi.string()
      .min(1)
      .max(255)
      .required(),
    recipe: Joi.string().min(1).max(50000).required(),
  });

  const result = Joi.validate(req.body, schema, {allowUnknown: true});
  if (result.error !== null) {
    res.status(400).json({ code: "INVALID_PARAMS" });
    return;
  }

  try {
    let id = await db.insertBot(req.body.name.toLowerCase(), req.body.recipe);
    res.status(200).json({ id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

router.get("/top/:name", async function(req, res) {
  const schema = Joi.object().keys({
    name: Joi.string()
      .min(1)
      .max(255)
      .required()
  });

  const result = Joi.validate(req.params, schema);
  if (result.error !== null) {
    res.status(400).json({ code: "INVALID_PARAMS" });
    return;
  }

  try {
    let data = await db.getTop(req.params.name);
    if (!data || data.length === 0) {
      res.status(404).json({ code: "BOT_NOT_FOUND" });
    } else {
      res.status(200).json({ data: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

router.get("/bot/:botid", async function(req, res) {
  const schema = Joi.object().keys({
    botid: Joi.string()
      .guid()
      .required()
  });

  const result = Joi.validate(req.params, schema);
  if (result.error !== null) {
    res.status(400).json({ code: "INVALID_PARAMS" });
    return;
  }

  try {
    let data = await db.loadBot(req.params.botid);
    if (!data) {
      res.status(404).json({ code: "BOT_NOT_FOUND" });
    } else {
      res.status(200).json({ data: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

export default router;
