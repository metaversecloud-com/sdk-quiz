import dotenv from "dotenv";
dotenv.config();

import {
  Topia,
  DroppedAssetFactory,
  WorldFactory,
  VisitorFactory,
  AssetFactory,
  UserFactory,
  WorldActivityFactory,
} from "@rtsdk/topia";

const config = {
  apiDomain: process.env.INSTANCE_DOMAIN,
  // apiKey: process.env.API_KEY,
  apiProtocol: process.env.INSTANCE_PROTOCOL,
  interactiveKey: process.env.INTERACTIVE_KEY,
  interactiveSecret: process.env.INTERACTIVE_SECRET,
};

const myTopiaInstance = await new Topia(config);

const DroppedAsset = new DroppedAssetFactory(myTopiaInstance);
const World = new WorldFactory(myTopiaInstance);
const Visitor = new VisitorFactory(myTopiaInstance);
const Asset = new AssetFactory(myTopiaInstance);
const User = new UserFactory(myTopiaInstance);
const WorldActivity = new WorldActivityFactory(myTopiaInstance);

export {
  DroppedAsset,
  myTopiaInstance,
  World,
  Visitor,
  Asset,
  User,
  WorldActivity,
};
