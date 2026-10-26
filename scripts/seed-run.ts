import { ensureSeedCars } from "../src/lib/seed-cars";

ensureSeedCars().then(() => {
  console.log("Seed cars ready in data/");
});
