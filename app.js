/**
 * RCB CHAMPIONS Accessories Shop - Client Logic
 * Features:
 * - 72 Inventory items across 6 Categories (12 per category) with unique IDs (1-72)
 * - Dynamic SVG image generation fallback to prevent broken thumbnails
 * - LocalStorage cart management with real-time totals
 * - Live product filtering and keyword search
 * - Client-side checkout with EmailJS automated confirmation delivery
 */

// ==================== 1. FALLBACK VECTOR GENERATOR ====================
const generateSvg = (type, brand, color = '#d32f2f') => {
  const brandText = brand.toUpperCase();
  let innerContent = '';

  switch (type) {
    case 'bat':
      innerContent = `
        <defs>
          <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#dfbb85"/>
            <stop offset="20%" stop-color="#fae3be"/>
            <stop offset="80%" stop-color="#edd2a4"/>
            <stop offset="100%" stop-color="#cda16a"/>
          </linearGradient>
        </defs>
        <rect x="92" y="10" width="16" height="70" rx="3" fill="#ffffff" stroke="#333" stroke-width="2"/>
        <line x1="92" y1="25" x2="108" y2="25" stroke="#333" stroke-width="2"/>
        <line x1="92" y1="40" x2="108" y2="40" stroke="#333" stroke-width="2"/>
        <line x1="92" y1="55" x2="108" y2="55" stroke="#333" stroke-width="2"/>
        <path d="M80,80 L120,80 L124,250 C124,265 110,270 100,270 C90,270 76,265 76,250 Z" fill="url(#woodGrad)" stroke="#664614" stroke-width="2"/>
        <rect x="84" y="95" width="32" height="60" rx="4" fill="${color}"/>
        <text x="100" y="132" font-size="11" font-family="Arial, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">${brandText}</text>
      `;
      break;

    case 'ball':
      const ballColor = color === 'white' ? '#f8f9fa' : (color === 'pink' ? '#e91e63' : '#b71c1c');
      const seamColor = color === 'white' ? '#111111' : '#ffffff';
      innerContent = `
        <circle cx="100" cy="140" r="50" fill="${ballColor}" stroke="#333" stroke-width="2"/>
        <path d="M65,140 Q100,110 135,140" fill="none" stroke="${seamColor}" stroke-width="3" stroke-dasharray="4,2"/>
        <path d="M65,140 Q100,170 135,140" fill="none" stroke="${seamColor}" stroke-width="3" stroke-dasharray="4,2"/>
        <text x="100" y="144" font-size="9" font-family="Arial, sans-serif" font-weight="bold" fill="${color === 'white' ? '#111' : '#fff'}" text-anchor="middle">${brandText}</text>
      `;
      break;

    case 'pad':
      innerContent = `
        <rect x="70" y="40" width="60" height="200" rx="15" fill="#f8f9fa" stroke="#adb5bd" stroke-width="2"/>
        <line x1="90" y1="40" x2="90" y2="240" stroke="#ced4da" stroke-width="3"/>
        <line x1="110" y1="40" x2="110" y2="240" stroke="#ced4da" stroke-width="3"/>
        <rect x="75" y="70" width="50" height="30" rx="6" fill="${color}"/>
        <text x="100" y="90" font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">${brandText}</text>
      `;
      break;

    case 'glove':
      innerContent = `
        <rect x="75" y="60" width="50" height="75" rx="12" fill="#ffffff" stroke="#6c757d" stroke-width="2"/>
        <rect x="80" y="135" width="40" height="40" rx="8" fill="#e9ecef" stroke="#6c757d" stroke-width="2"/>
        <rect x="75" y="175" width="50" height="15" rx="4" fill="${color}"/>
        <text x="100" y="186" font-size="9" font-family="Arial, sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">${brandText}</text>
      `;
      break;

    case 'net':
      innerContent = `
        <rect x="35" y="50" width="130" height="160" fill="none" stroke="#212529" stroke-width="4"/>
        <path d="M35,70 H165 M35,90 H165 M35,110 H165 M35,130 H165 M35,150 H165 M35,170 H165 M35,190 H165" stroke="#495057" stroke-width="1.5"/>
        <path d="M55,50 V210 M75,50 V210 M95,50 V210 M115,50 V210 M135,50 V210 M155,50 V210" stroke="#495057" stroke-width="1.5"/>
        <rect x="65" y="115" width="70" height="30" rx="4" fill="${color}"/>
        <text x="100" y="134" font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">${brandText}</text>
      `;
      break;

    case 'bag':
      innerContent = `
        <rect x="65" y="50" width="70" height="170" rx="14" fill="#212529" stroke="#343a40" stroke-width="2"/>
        <rect x="75" y="70" width="50" height="80" rx="8" fill="${color}"/>
        <circle cx="80" cy="225" r="8" fill="#111"/>
        <circle cx="120" cy="225" r="8" fill="#111"/>
        <text x="100" y="115" font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">${brandText}</text>
      `;
      break;

    default:
      innerContent = `
        <rect x="65" y="80" width="70" height="100" rx="8" fill="#e9ecef" stroke="#adb5bd" stroke-width="2"/>
        <rect x="75" y="110" width="50" height="30" rx="4" fill="${color}"/>
        <text x="100" y="129" font-size="10" font-family="Arial, sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">${brandText}</text>
      `;
  }

  const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="200" height="280">${innerContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgRaw)}`;
};

// ==================== 2. COMPLETE INVENTORY DATASET ====================
// Exactly 72 items (12 items across 6 categories) with sequential IDs 1 to 72[cite: 13]
const products = [
  // --- Category 1: Cricket Bats (IDs 1 - 12) ---
  { id: 1, name: "MRF Genius Grand Edition (VK 18)", brand: "MRF", category: "Cricket Bats", spec: "Grade 1 English Willow", price: 24500, rating: 5.0, img: "bats/mrfbat.jpg", fallbackType: "bat", fallbackColor: "#d32f2f" },
  { id: 2, name: "SS Master 7000 Retro Bat", brand: "SS", category: "Cricket Bats", spec: "Hand Selected English Willow", price: 18500, rating: 4.8, img: "bats/ss.jpg", fallbackType: "bat", fallbackColor: "#ffc107" },
  { id: 3, name: "SG Sunny Tonny Classic Icon Bat", brand: "SG", category: "Cricket Bats", spec: "Traditional Test Match Profile", price: 16900, rating: 4.9, img: "bats/sg.jpg", fallbackType: "bat", fallbackColor: "#000000" },
  { id: 4, name: "CEAT Hitman Rohit Sharma Bat", brand: "CEAT", category: "Cricket Bats", spec: "Contoured Profile English Willow", price: 21500, rating: 4.9, img: "bats/ceat.jpg", fallbackType: "bat", fallbackColor: "#0056b3" },
  { id: 5, name: "Kookaburra Kahuna Pro Bat", brand: "Kookaburra", category: "Cricket Bats", spec: "High Sweet Spot Performance Blade", price: 23000, rating: 4.8, img: "bats/kookaburra.jpg", fallbackType: "bat", fallbackColor: "#2e7d32" },
  { id: 6, name: "Gray-Nicolls Shockwave 2.0 Bat", brand: "Gray-Nicolls", category: "Cricket Bats", spec: "Mid-Blade Balance Profile", price: 19800, rating: 4.7, img: "bats/gray.jpg", fallbackType: "bat", fallbackColor: "#c62828" },
  { id: 7, name: "DSC Krunch 5.0 English Willow", brand: "DSC", category: "Cricket Bats", spec: "Massive Edges Power Curve", price: 14500, rating: 4.6, img: "bats/dsc.jpg", fallbackType: "bat", fallbackColor: "#1565c0" },
  { id: 8, name: "MRF Chase Master Edition", brand: "MRF", category: "Cricket Bats", spec: "Balanced Pickup Short Handle", price: 17200, rating: 4.7, img: "bats/chase.jpg", fallbackType: "bat", fallbackColor: "#d32f2f" },
  { id: 9, name: "TON Master 7000 English Willow Bat", brand: "SS", category: "Cricket Bats", spec: "Grade 1 English Willow", price: 18500, rating: 4.8, img: "bats/ton.jpg", fallbackType: "bat", fallbackColor: "#ffc107" },
  { id: 10, name: "Nike Sparq Edition Willow Bat", brand: "Nike", category: "Cricket Bats", spec: "Premium Player Profile English Willow", price: 21000, rating: 4.9, img: "bats/nike.jpg", fallbackType: "bat", fallbackColor: "#212529" },
  { id: 11, name: "Spartan MSD 7 Limited Edition Bat", brand: "Spartan", category: "Cricket Bats", spec: "Grade 1 English Willow - Massive Sweet Spot", price: 22500, rating: 4.9, img: "bats/spartan.jpg", fallbackType: "bat", fallbackColor: "#d32f2f" },
  { id: 12, name: "Hero Honda Vintage Edition Bat", brand: "Hero", category: "Cricket Bats", spec: "Classic Profile Handcrafted English Willow", price: 19500, rating: 4.8, img: "bats/hero.jpg", fallbackType: "bat", fallbackColor: "#d32f2f" },

  // --- Category 2: Cricket Balls (IDs 13 - 24) ---
  { id: 13, name: "SG Club Leather Match Ball (Red)", brand: "SG", category: "Cricket Balls", spec: "4-Piece Alum Tanned Leather", price: 650, rating: 4.7, img: "balls/sg.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 14, name: "Kookaburra Turf White Match Ball", brand: "Kookaburra", category: "Cricket Balls", spec: "ICC Approved ODI/T20 Ball", price: 2800, rating: 5.0, img: "balls/kooku.jpg", fallbackType: "ball", fallbackColor: "white" },
  { id: 15, name: "Kookaburra Pink Day-Night Test Ball", brand: "Kookaburra", category: "Cricket Balls", spec: "Polyurethane Finish Pink Ball", price: 2950, rating: 4.9, img: "balls/pink.jpg", fallbackType: "ball", fallbackColor: "pink" },
  { id: 16, name: "SS True Flight League Leather Ball", brand: "SS", category: "Cricket Balls", spec: "Cork Centre Seam Construction", price: 590, rating: 4.5, img: "balls/sgleather.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 17, name: "CEAT Match League White Ball", brand: "CEAT", category: "Cricket Balls", spec: "High Visibility Seam Finish", price: 780, rating: 4.6, img: "balls/ceatwhite.jpg", fallbackType: "ball", fallbackColor: "white" },
  { id: 18, name: "SG Tournament Special Red Ball", brand: "SG", category: "Cricket Balls", spec: "Waterproof Top Grain Leather", price: 850, rating: 4.7, img: "balls/sgred.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 19, name: "MRF Pace Foundation Match Leather", brand: "MRF", category: "Cricket Balls", spec: "Hand Stitched Greased Leather", price: 920, rating: 4.8, img: "balls/mrfball.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 20, name: "DSC Heavy Synthetic Wind Ball (Pack of 6)", brand: "DSC", category: "Cricket Balls", spec: "Outdoor Practice Wind Balls", price: 720, rating: 4.5, img: "balls/dscwind.jpg", fallbackType: "ball", fallbackColor: "white" },
  { id: 21, name: "Gray-Nicolls Wonder Seam Training Ball", brand: "Gray-Nicolls", category: "Cricket Balls", spec: "Two-Tone Swing Practice Ball", price: 890, rating: 4.6, img: "balls/grayball.jpg", fallbackType: "ball", fallbackColor: "white" },
  { id: 22, name: "SS County Match Red Leather Box (6 Balls)", brand: "SS", category: "Cricket Balls", spec: "League Grade Match Pack", price: 3400, rating: 4.9, img: "balls/ssbox.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 23, name: "Spartan MSD Test Seam Red Ball", brand: "Spartan", category: "Cricket Balls", spec: "High Seam English Lacquer Polish", price: 750, rating: 4.6, img: "balls/spartanball.jpg", fallbackType: "ball", fallbackColor: "red" },
  { id: 24, name: "SG White Leather Ball", brand: "SG", category: "Cricket Balls", spec: "Moulded High Impact Training Ball", price: 520, rating: 4.4, img: "balls/sgwhite.jpg", fallbackType: "ball", fallbackColor: "white" },

  // --- Category 3: Leg Guards (IDs 25 - 36) ---
  { id: 25, name: "SS Test Opener Batting Pads", brand: "SS", category: "Leg Guards", spec: "High Density Sponge Foam", price: 2900, rating: 4.8, img: "pads/sspad.jpg", fallbackType: "pad", fallbackColor: "#ffc107" },
  { id: 26, name: "SG Test Pro Compact Leg Guards", brand: "SG", category: "Leg Guards", spec: "Moulded Knee Cup Protection", price: 3400, rating: 4.9, img: "pads/sgpad.jpg", fallbackType: "pad", fallbackColor: "#000000" },
  { id: 27, name: "MRF Genius Virat Edition Pads", brand: "MRF", category: "Leg Guards", spec: "Lightweight Traditional Cane Bars", price: 3600, rating: 4.9, img: "pads/mrfpad.jpg", fallbackType: "pad", fallbackColor: "#d32f2f" },
  { id: 28, name: "CEAT Hitman Pro Batting Pads", brand: "CEAT", category: "Leg Guards", spec: "Air-Mesh Bolster Cushioning", price: 3100, rating: 4.7, img: "pads/ceatpad.jpg", fallbackType: "pad", fallbackColor: "#0056b3" },
  { id: 29, name: "Kookaburra Kahuna 3.1 Leg Guards", brand: "Kookaburra", category: "Leg Guards", spec: "Triple Section Knee Wing System", price: 3800, rating: 4.8, img: "pads/kookapad.jpg", fallbackType: "pad", fallbackColor: "#2e7d32" },
  { id: 30, name: "Gray-Nicolls GN Powerbow Pads", brand: "Gray-Nicolls", category: "Leg Guards", spec: "Ergonomic Arch Protection", price: 3950, rating: 4.7, img: "pads/graypad.jpg", fallbackType: "pad", fallbackColor: "#c62828" },
  { id: 31, name: "DSC Intense Attitude Batting Pads", brand: "DSC", category: "Leg Guards", spec: "Compact Polyurethane Face", price: 2400, rating: 4.5, img: "pads/dscpad.jpg", fallbackType: "pad", fallbackColor: "#1565c0" },
  { id: 32, name: "SG Club Wicket Keeping Pads", brand: "SG", category: "Leg Guards", spec: "Short-Cut Agile Shin Guard", price: 2200, rating: 4.7, img: "pads/sgkeeppad.jpg", fallbackType: "pad", fallbackColor: "#000000" },
  { id: 33, name: "SS Match Master Wicket Keeping Pads", brand: "SS", category: "Leg Guards", spec: "Ultra-Light Carbon Pattern", price: 2600, rating: 4.8, img: "pads/sskeeppad.jpg", fallbackType: "pad", fallbackColor: "#ffc107" },
  { id: 34, name: "Spartan MS 7 Pro Match Pads", brand: "Spartan", category: "Leg Guards", spec: "HD Shielding with Padded Straps", price: 3250, rating: 4.6, img: "pads/spartanpad.jpg", fallbackType: "pad", fallbackColor: "#d32f2f" },
  { id: 35, name: "GM Aero Diamond Pro Batting Pads", brand: "Gm", category: "Leg Guards", spec: "Ultra Light Ergonomic Shin Shell", price: 3700, rating: 4.8, img: "pads/gmpad.jpg", fallbackType: "pad", fallbackColor: "#212529" },
  { id: 36, name: "SF Classic Edition Pads", brand: "SF", category: "Leg Guards", spec: "Traditional Moulded Cane Strips", price: 2800, rating: 4.5, img: "pads/sf.jpg", fallbackType: "pad", fallbackColor: "#d32f2f" },

  // --- Category 4: Batting Gloves (IDs 37 - 48) ---
  { id: 37, name: "MRF Genius Elite Batting Gloves", brand: "MRF", category: "Batting Gloves", spec: "Sheep Leather Pittard Palm", price: 2300, rating: 4.8, img: "gloves/mrfglove.jpg", fallbackType: "glove", fallbackColor: "#d32f2f" },
  { id: 38, name: "SS Heritage Multi-Flex Batting Gloves", brand: "SS", category: "Batting Gloves", spec: "Split Finger Sausage Padded", price: 2100, rating: 4.7, img: "gloves/ssglove.jpg", fallbackType: "glove", fallbackColor: "#ffc107" },
  { id: 39, name: "SG Test White Batting Gloves", brand: "SG", category: "Batting Gloves", spec: "Fibre-Reinforced Finger Tops", price: 2450, rating: 4.9, img: "gloves/sgglove.jpg", fallbackType: "glove", fallbackColor: "#000000" },
  { id: 40, name: "Kookaburra Ghost Pro Gloves", brand: "Kookaburra", category: "Batting Gloves", spec: "All-White Test Profile Palm", price: 2750, rating: 4.9, img: "gloves/kookaglove.jpg", fallbackType: "glove", fallbackColor: "#2e7d32" },
  { id: 41, name: "CEAT Ultimate Hitman Gloves", brand: "CEAT", category: "Batting Gloves", spec: "High Impact Absorption Gel", price: 1950, rating: 4.6, img: "gloves/ceatglove.jpg", fallbackType: "glove", fallbackColor: "#0056b3" },
  { id: 42, name: "Gray-Nicolls GN Classic Finger Gloves", brand: "Gray-Nicolls", category: "Batting Gloves", spec: "Perforated Air Flow Palm", price: 2600, rating: 4.8, img: "gloves/grayglove.jpg", fallbackType: "glove", fallbackColor: "#c62828" },
  { id: 43, name: "DSC Rebel Batting Gloves", brand: "DSC", category: "Batting Gloves", spec: "Flexible Double Side Sweatband", price: 1650, rating: 4.5, img: "gloves/dscglove.jpg", fallbackType: "glove", fallbackColor: "#1565c0" },
  { id: 44, name: "SG Tournament Pro Keeping Gloves", brand: "SG", category: "Batting Gloves", spec: "Octopus Rubber Grip Webbing", price: 2800, rating: 4.8, img: "gloves/sgkeepglove.jpg", fallbackType: "glove", fallbackColor: "#000000" },
  { id: 45, name: "SS Match Master Keeping Gloves", brand: "SS", category: "Batting Gloves", spec: "Full Aniline Leather Back", price: 2950, rating: 4.7, img: "gloves/sskeepglove.jpg", fallbackType: "glove", fallbackColor: "#ffc107" },
  { id: 46, name: "Spartan MSD Strike Pro Gloves", brand: "Spartan", category: "Batting Gloves", spec: "High Density Shield Protection", price: 2200, rating: 4.7, img: "gloves/spartanglove.jpg", fallbackType: "glove", fallbackColor: "#d32f2f" },
  { id: 47, name: "Nike Vapor Cricket Gripper Gloves", brand: "Nike", category: "Batting Gloves", spec: "Breathable Mesh Flexible Rollers", price: 2500, rating: 4.8, img: "gloves/nikeglove.jpg", fallbackType: "glove", fallbackColor: "#212529" },
  { id: 48, name: "Hero SF Captain Match Gloves", brand: "Hero", category: "Batting Gloves", spec: "Dual Layer Sponge Cushioning", price: 1850, rating: 4.5, img: "gloves/heroglove.jpg", fallbackType: "glove", fallbackColor: "#d32f2f" },

  // --- Category 5: Cricket Nets & Ground (IDs 49 - 60) ---
  { id: 49, name: "Pro Academy Cricket Net (100ft x 10ft)", brand: "NETXSPORTS", category: "Cricket Nets & Ground", spec: "UV Stabilized 3mm Knotted Mesh", price: 7800, rating: 4.9, img: "nets/netx.jpg", fallbackType: "net", fallbackColor: "#1565c0" },
  { id: 50, name: "Heavy Box Cricket Batting Net (50ft x 12ft)", brand: "SG", category: "Cricket Nets & Ground", spec: "Knotted Weatherproof Twine", price: 5400, rating: 4.8, img: "nets/sgboxnet.jpg", fallbackType: "net", fallbackColor: "#000000" },
  { id: 51, name: "Backyard Practice Tunnel Net (30ft)", brand: "SS", category: "Cricket Nets & Ground", spec: "Hanging Loops & Fastening Ropes", price: 3900, rating: 4.7, img: "nets/sstunnel.jpg", fallbackType: "net", fallbackColor: "#ffc107" },
  { id: 52, name: "Artificial Turf Cricket Pitch Mat (66ft)", brand: "DSC", category: "Cricket Nets & Ground", spec: "Full Match Length 10mm High Density", price: 18500, rating: 4.9, img: "nets/turf66.jpg", fallbackType: "net", fallbackColor: "#2e7d32" },
  { id: 53, name: "Half Pitch Practice Turf Mat (33ft)", brand: "SG", category: "Cricket Nets & Ground", spec: "All-Weather Bowling & Batting Mat", price: 9500, rating: 4.8, img: "nets/turf33.jpg", fallbackType: "net", fallbackColor: "#000000" },
  { id: 54, name: "SG Club Spring Loaded Stumps", brand: "SG", category: "Cricket Nets & Ground", spec: "Solid Ashwood Base with Springs", price: 3100, rating: 4.9, img: "nets/sgstump.jpg", fallbackType: "net", fallbackColor: "#000000" },
  { id: 55, name: "SS Target Training Cricket Stumps", brand: "SS", category: "Cricket Nets & Ground", spec: "Single Spike Metal Spring Stump", price: 850, rating: 4.6, img: "nets/ssstump.jpg", fallbackType: "net", fallbackColor: "#ffc107" },
  { id: 56, name: "Wooden Match Stumps with Bails (Set of 6)", brand: "CEAT", category: "Cricket Nets & Ground", spec: "Polished Seasoned Sheesham Wood", price: 1600, rating: 4.7, img: "nets/ceatstump.jpg", fallbackType: "net", fallbackColor: "#0056b3" },
  { id: 57, name: "Boundary Rope Reel (250 Metres x 24mm)", brand: "DSC", category: "Cricket Nets & Ground", spec: "PP Water Repellent Boundary Rope", price: 12500, rating: 4.8, img: "nets/boundaryrope.jpg", fallbackType: "net", fallbackColor: "#1565c0" },
  { id: 58, name: "Ground Bowler Field Marker Discs Set", brand: "SS", category: "Cricket Nets & Ground", spec: "Pack of 20 Field Training Cones", price: 650, rating: 4.7, img: "nets/markercones.jpg", fallbackType: "net", fallbackColor: "#ffc107" },
  { id: 59, name: "Kookaburra Turf Boundary Flags (Set of 10)", brand: "Kookaburra", category: "Cricket Nets & Ground", spec: "High Visibility Fluorescent Cloth", price: 1200, rating: 4.6, img: "nets/kookaflags.jpg", fallbackType: "net", fallbackColor: "#2e7d32" },
  { id: 60, name: "Gray-Nicolls Pitch Mark Crease Tape", brand: "Gray-Nicolls", category: "Cricket Nets & Ground", spec: "Self Adhesive Weatherproof Tape", price: 550, rating: 4.5, img: "nets/graytape.jpg", fallbackType: "net", fallbackColor: "#c62828" },

  // --- Category 6: Tournament Kits & Bags (IDs 61 - 72) ---
  { id: 61, name: "Gray-Nicolls Legend Wheelie Kit Bag", brand: "Gray-Nicolls", category: "Tournament Kits", spec: "Triple Bat Integrated Vault", price: 6800, rating: 4.9, img: "kits/graybag.jpg", fallbackType: "bag", fallbackColor: "#c62828" },
  { id: 62, name: "SS Master Player Stand-Up Duffle Bag", brand: "SS", category: "Tournament Kits", spec: "Heavy Reinforced Base Compartment", price: 4200, rating: 4.8, img: "kits/ssbag.jpg", fallbackType: "bag", fallbackColor: "#ffc107" },
  { id: 63, name: "SG Savage Tournament Heavy Wheelie Bag", brand: "SG", category: "Tournament Kits", spec: "Tractor Wheel Off-Road Mobility", price: 5400, rating: 4.8, img: "kits/sgbag.jpg", fallbackType: "bag", fallbackColor: "#000000" },
  { id: 64, name: "MRF Genius Wheelie Tournament Bag", brand: "MRF", category: "Tournament Kits", spec: "Full Senior Kit Room Capacity", price: 4900, rating: 4.9, img: "kits/mrfbag.jpg", fallbackType: "bag", fallbackColor: "#d32f2f" },
  { id: 65, name: "DSC Condor Force XL Duffle Kit Bag", brand: "DSC", category: "Tournament Kits", spec: "Ergonomic Back Straps with Lock Zip", price: 3600, rating: 4.6, img: "kits/dscbag.jpg", fallbackType: "bag", fallbackColor: "#1565c0" },
  { id: 66, name: "Kookaburra Pro 2.0 Wheelie Gear Bag", brand: "Kookaburra", category: "Tournament Kits", spec: "Side Bat Pockets & Internal Coolzone", price: 5900, rating: 4.7, img: "kits/kookabags.jpg", fallbackType: "bag", fallbackColor: "#2e7d32" },
  { id: 67, name: "CEAT Hitman Edition Full Duffle Pack", brand: "CEAT", category: "Tournament Kits", spec: "Reinforced Water-Resistant Base", price: 3800, rating: 4.7, img: "kits/ceatbag.jpg", fallbackType: "bag", fallbackColor: "#0056b3" },
  { id: 68, name: "Shrey Match Day Pro Duffle Bag", brand: "Shrey", category: "Tournament Kits", spec: "Dedicated Shoe & Helmet Vault", price: 4500, rating: 4.8, img: "kits/shreybag.jpg", fallbackType: "bag", fallbackColor: "#212529" },
  { id: 69, name: "Spartan MSD 7 Warrior Wheelie Bag", brand: "Spartan", category: "Tournament Kits", spec: "Heavy-Duty Ballistic Nylon Shell", price: 5200, rating: 4.8, img: "kits/spartanbag.jpg", fallbackType: "bag", fallbackColor: "#d32f2f" },
  { id: 70, name: "Heega Vintage Pro Player Kit Carrier", brand: "Heega", category: "Tournament Kits", spec: "Double Bat Padded Compartment", price: 3400, rating: 4.6, img: "kits/heegabag.jpg", fallbackType: "bag", fallbackColor: "#d32f2f" },
  { id: 71, name: "Nike Striker Tournament Bag", brand: "Nike", category: "Tournament Kits", spec: "Dual Section Thermal Padded Shell", price: 5800, rating: 4.9, img: "kits/nikebag.jpg", fallbackType: "bag", fallbackColor: "#212529" },
  { id: 72, name: "SS Heritage Compact Bag", brand: "SS", category: "Tournament Kits", spec: "Lightweight Quick Travel Kit Bag", price: 2600, rating: 4.5, img: "kits/sshbag.jpg", fallbackType: "bag", fallbackColor: "#ffc107" }
];

// ==================== 3. APPLICATION STATE & DOM REFERENCES ====================
let cart = JSON.parse(localStorage.getItem("rcbCartFinal")) || [];

const productGrid = document.querySelector("#productGrid");
const productCountText = document.querySelector("#productCountText");
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const brandFilter = document.querySelector("#brandFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const cartItemsList = document.querySelector("#cartItemsList");
const cartBadge = document.querySelector("#cartBadge");
const cartTotalPrice = document.querySelector("#cartTotalPrice");
const orderForm = document.querySelector("#orderForm");
const contactForm = document.querySelector("#contactForm");
const submitOrderBtn = document.querySelector("#submitOrderBtn");
const submitBtnText = document.querySelector("#submitBtnText");
const submitBtnSpinner = document.querySelector("#submitBtnSpinner");

// ==================== 4. PRODUCT RENDERING & SEARCH ====================
const renderProducts = (items) => {
  productGrid.innerHTML = "";
  if (productCountText) {
    productCountText.textContent = `Showing ${items.length} tournament-certified cricket items`;
  }

  if (items.length === 0) {
    productGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <h5 class="text-muted mt-2">No cricket gear matches your criteria.</h5>
        <p class="text-muted small">Try searching another brand or keyword.</p>
      </div>`;
    return;
  }

  items.forEach(product => {
    const { id, name, brand, category, spec, price, rating, img, fallbackType, fallbackColor } = product;
    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-6 col-lg-4";
    
    const fallbackSvg = generateSvg(fallbackType, brand, fallbackColor);

    cardCol.innerHTML = `
      <div class="card product-card h-100 shadow-sm border-0">
        <div class="product-image-container" onclick="openQuickView(${id})" style="cursor: pointer;">
          <img src="${img}" class="product-vector-img" alt="${name}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-danger badge-brand">${brand}</span>
            <span class="badge bg-secondary badge-brand">${category}</span>
            <small class="text-warning fw-bold"><i class="bi bi-star-fill"></i> ${rating}</small>
          </div>
          <h5 class="card-title fw-bold text-truncate" title="${name}">${name}</h5>
          <p class="text-muted small mb-2"><i class="bi bi-check2-circle text-success me-1"></i>${spec}</p>
          <h5 class="text-danger fw-bold mb-3">₹${price.toLocaleString("en-IN")}</h5>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-outline-dark btn-sm flex-grow-1" onclick="openQuickView(${id})">Details</button>
            <button class="btn btn-dark btn-sm flex-grow-1 fw-semibold" onclick="addToCart(${id})">
              <i class="bi bi-cart-plus me-1"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
    productGrid.appendChild(cardCol);
  });
};

const filterProducts = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedBrand = brandFilter.value;
  const selectedCategory = categoryFilter.value;

  const filtered = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                          item.brand.toLowerCase().includes(searchTerm) ||
                          item.category.toLowerCase().includes(searchTerm) ||
                          item.spec.toLowerCase().includes(searchTerm);
    const matchesBrand = selectedBrand === "All" || item.brand === selectedBrand;
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesBrand && matchesCat;
  });

  renderProducts(filtered);
};

window.setCategoryFilter = (catName) => {
  categoryFilter.value = catName;
  brandFilter.value = "All";
  searchInput.value = "";
  filterProducts();
  document.querySelector("#productsSection").scrollIntoView({ behavior: "smooth" });
};

// ==================== 5. CART STATE & STORAGE ====================
const saveCart = () => {
  localStorage.setItem("rcbCartFinal", JSON.stringify(cart));
  renderCart();
};

window.addToCart = (productId) => {
  const itemInCart = cart.find(item => item.id === productId);
  if (itemInCart) {
    itemInCart.quantity += 1;
  } else {
    const itemToAdd = products.find(p => p.id === productId);
    cart.push({ ...itemToAdd, quantity: 1 });
  }
  saveCart();
};

window.updateQuantity = (productId, change) => {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
  }
  saveCart();
};

window.removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
};

const renderCart = () => {
  cartItemsList.innerHTML = "";
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartBadge.textContent = totalCount;
  cartTotalPrice.textContent = `₹${totalPrice.toLocaleString("en-IN")}`;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-cart-x fs-1 text-danger"></i>
        <p class="mt-2">Your cart is empty.</p>
      </div>`;
    return;
  }

  cart.forEach(item => {
    const itemRow = document.createElement("div");
    itemRow.className = "cart-item-row d-flex justify-content-between align-items-center";
    itemRow.innerHTML = `
      <div>
        <h6 class="mb-0 fw-bold">${item.name}</h6>
        <small class="text-muted">₹${item.price.toLocaleString("en-IN")} x ${item.quantity}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
        <span class="fw-bold">${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
        <button class="btn btn-sm btn-danger ms-1" onclick="removeFromCart(${item.id})"><i class="bi bi-trash"></i></button>
      </div>
    `;
    cartItemsList.appendChild(itemRow);
  });
};

// ==================== 6. QUICK VIEW MODAL ====================
window.openQuickView = (productId) => {
  const item = products.find(p => p.id === productId);
  if (!item) return;

  document.querySelector("#qvName").textContent = item.name;
  document.querySelector("#qvSpec").textContent = item.spec;
  document.querySelector("#qvBrand").textContent = item.brand;
  document.querySelector("#qvCategory").textContent = item.category;
  document.querySelector("#qvRating").innerHTML = `<i class="bi bi-star-fill text-warning"></i> ${item.rating} Rating`;
  document.querySelector("#qvPrice").textContent = `₹${item.price.toLocaleString("en-IN")}`;
  
  const fallbackSvg = generateSvg(item.fallbackType, item.brand, item.fallbackColor);
  document.querySelector("#qvImageContainer").innerHTML = `
    <img src="${item.img}" style="max-height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='${fallbackSvg}';">
  `;

  const addBtn = document.querySelector("#qvAddToCartBtn");
  addBtn.onclick = () => {
    addToCart(item.id);
    const qvModal = bootstrap.Modal.getInstance(document.querySelector("#quickViewModal"));
    if (qvModal) qvModal.hide();
  };

  const modalInstance = new bootstrap.Modal(document.querySelector("#quickViewModal"));
  modalInstance.show();
};

// ==================== 7. OPTIMIZED ORDER DISPATCH & EMAIL INTEGRATION ====================
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (cart.length === 0) {
    alert("Cart is empty! Please add products before placing an order.");
    return;
  }

  const name = document.querySelector("#custName").value.trim();
  const email = document.querySelector("#custEmail").value.trim();
  const phone = document.querySelector("#custPhone").value.trim();
  const address = document.querySelector("#custAddress").value.trim();
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const orderSummaryText = cart.map((item, idx) => 
    `${idx + 1}. ${item.name} (${item.brand}) - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
  ).join("\n");

  // Show UI loading spinner
  submitOrderBtn.disabled = true;
  submitBtnText.classList.add("d-none");
  submitBtnSpinner.classList.remove("d-none");

  const emailParams = {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    customer_address: address,
    order_items: orderSummaryText,
    total_amount: `₹${totalPrice.toLocaleString("en-IN")}`,
    order_id: `RCB-${Date.now().toString().slice(-6)}`
  };

  let emailSentSuccessfully = false;

  try {
    if (window.emailjs && window.emailjs.send) {
      await emailjs.send("service_w4qgp15", "template_88k7a65", emailParams);
      emailSentSuccessfully = true;
    }
  } catch (error) {
    console.warn("EmailJS error:", error.message);
  }

  // Instant UI unblock before alert
  submitOrderBtn.disabled = false;
  submitBtnText.classList.remove("d-none");
  submitBtnSpinner.classList.add("d-none");

  const checkoutModalEl = document.querySelector("#checkoutModal");
  const modalInstance = bootstrap.Modal.getInstance(checkoutModalEl);
  if (modalInstance) {
    modalInstance.hide();
  }

  // Clear session cart
  cart = [];
  saveCart();
  orderForm.reset();

  // Asynchronous non-blocking feedback
  setTimeout(() => {
    alert(`Thank you, ${name}! Your order #${emailParams.order_id} has been recorded and the invoice confirmation email has been initiated to ${email}.`);
  }, 200);
});

// General contact enquiry form handler
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thank you! Our cricket academy and net specialist will contact you shortly.");
  contactForm.reset();
});

// Real-time Event Listeners for Filters
searchInput.addEventListener("input", filterProducts);
searchBtn.addEventListener("click", filterProducts);
brandFilter.addEventListener("change", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

// Initial Load on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
  renderCart();
});