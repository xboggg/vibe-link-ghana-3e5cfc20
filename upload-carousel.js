const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabase = createClient(
  "https://tmsqhpkongedudbkekqh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc3FocGtvbmdlZHVkYmtla3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjc5MDQ2MCwiZXhwIjoyMDQ4MzY2NDYwfQ.UQhZl5Jy4EpjBvqt9M6o7F8M5sS7dIqOuaGLNKoP9Uw"
);

const images = [
  { file: "wedding.png", name: "carousel-wedding.png" },
  { file: "naming.png", name: "carousel-naming.png" },
  { file: "graduation.png", name: "carousel-graduation.png" },
  { file: "church.png", name: "carousel-church.png" },
  { file: "coporate.png", name: "carousel-corporate.png" },
  { file: "memorial.png", name: "carousel-memorial.png" }
];

async function uploadImages() {
  const urls = [];
  
  for (const img of images) {
    const filePath = path.join("/tmp/vibelink-carousel", img.file);
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from("site-assets")
      .upload(img.name, fileBuffer, {
        contentType: "image/png",
        upsert: true
      });
    
    if (error) {
      console.error("Error uploading", img.file, error.message);
    } else {
      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(img.name);
      urls.push({ label: img.file.replace(".png", ""), url: urlData.publicUrl });
      console.log("Uploaded:", img.name, "->", urlData.publicUrl);
    }
  }
  
  console.log("\nAll URLs:");
  urls.forEach(u => console.log(u.label + ": " + u.url));
}

uploadImages();
