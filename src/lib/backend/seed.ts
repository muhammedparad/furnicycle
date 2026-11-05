import { districtCoords } from "../constants";
import type { Category, Condition, Listing } from "../types";

/**
 * Sample listings for local mode only, so the site can be tried before Supabase
 * is connected. They have no photos; the frame draws the furniture instead.
 */
type Row = [title: string, category: Category, condition: Condition, price: number, district: string, town: string, description: string];

const ROWS: Row[] = [
  ["Three-seater teak sofa with cushions", "sofa", "good", 9500, "Ernakulam", "Kakkanad", "Solid teak frame, cushions recovered last year in grey cotton. Moving to Bengaluru, must go this month."],
  ["Queen size cot, rosewood finish", "bed", "fair", 6000, "Thrissur", "Ollur", "Sturdy cot with headboard. Some polish wear on the side rails. Mattress not included."],
  ["Plastic study chair", "chair", "fair", 0, "Kozhikode", "Nadakkavu", "Free to anyone who can collect from the ground floor. Slight crack on one armrest."],
  ["Six-seater dining set", "dining", "good", 14500, "Thiruvananthapuram", "Pattom", "Glass-top table with six cushioned chairs. Table legs are steel, chairs are rubberwood."],
  ["Two-door steel almirah", "wardrobe", "good", 4500, "Kottayam", "Ettumanoor", "Godrej-style steel wardrobe with locker and mirror. No rust. Needs two people to carry."],
  ["Bookshelf, five shelves", "shelf", "like-new", 2800, "Ernakulam", "Edappally", "Engineered wood, walnut colour. Bought eight months ago, assembled once."],
  ["Work-from-home desk", "desk", "like-new", 3900, "Ernakulam", "Kaloor", "120 cm desk with cable tray and one drawer. Comes apart for transport."],
  ["Old wooden kitchen cabinet", "cabinet", "needs-repair", 0, "Alappuzha", "Mullakkal", "Wooden cabinet from my grandmother's house. One door hinge is loose. Free, collect from Mullakkal."],
  ["Cane easy chair (chaaru kasera)", "chair", "good", 2200, "Palakkad", "Olavakkode", "Traditional reclining cane chair. Cane seat redone two years ago."],
  ["L-shaped sofa, fabric", "sofa", "like-new", 21000, "Kannur", "Thalap", "Five-seater L-shape in dark blue fabric, one year old. Selling because we are moving abroad."],
  ["Single cot for children", "bed", "good", 2500, "Malappuram", "Kottakkal", "Wooden single cot, 6 x 3 feet. Good for a kid's room or hostel."],
  ["Coffee table, glass top", "table", "fair", 1200, "Kollam", "Chinnakada", "Small centre table with lower shelf. A few scratches on the glass."],
  ["Shoe rack, three tiers", "shelf", "good", 0, "Thrissur", "Punkunnam", "Plastic shoe rack, free. Clean and dry, just no space for it any more."],
  ["Office chair with arm rests", "chair", "good", 1800, "Thiruvananthapuram", "Technopark", "Mesh back, height adjustable. Wheels all work."],
  ["Teak dressing table with mirror", "cabinet", "good", 5500, "Pathanamthitta", "Adoor", "Dressing table with three drawers and an oval mirror. Heavy, solid wood."],
  ["Folding dining table for four", "dining", "fair", 0, "Wayanad", "Kalpetta", "Folding table with four plastic chairs. Free for anyone setting up a new home."],
  ["Three-door wardrobe with mirror", "wardrobe", "like-new", 11000, "Kozhikode", "Mavoor Road", "Engineered wood, white. Two years old. Disassembled and ready to load."],
  ["Wooden side table pair", "table", "good", 1600, "Idukki", "Thodupuzha", "Two matching bedside tables with one drawer each."],
  ["Computer table, compact", "desk", "fair", 900, "Kasaragod", "Vidyanagar", "Small desk with keyboard tray. One edge chipped."],
  ["Diwan cot with storage", "bed", "good", 4800, "Ernakulam", "Aluva", "Diwan with two pull-out drawers underneath. Good for a hall."],
];

const DAY = 86_400_000;

export function seedListings(now = Date.now()): Listing[] {
  return ROWS.map(([title, category, condition, price, district, town, description], i) => {
    const c = districtCoords(district);
    const created = new Date(now - (i * 0.7 + 0.2) * DAY).toISOString();
    return {
      id: `demo-${i + 1}`,
      user_id: "demo",
      title,
      description,
      category,
      condition,
      price,
      is_free: price === 0,
      district,
      town,
      lat: c.lat,
      lng: c.lng,
      images: [],
      status: i === 4 ? "sold" : "available",
      seller_name: "Demo seller",
      contact_phone: "9000000000",
      whatsapp: true,
      featured: i === 0 || i === 9,
      created_at: created,
      updated_at: created,
    };
  });
}
