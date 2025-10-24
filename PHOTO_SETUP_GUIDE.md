# 📸 Photo Setup Guide for "Moments"

## How to Add Your 160+ Photos

### Step 1: Extract Your ZIP Files

You have 5 ZIP files uploaded:
- `part_1.zip`
- `part_2.zip`
- `part_3.zip`
- `part_4.zip`
- `part_5.zip`

Extract all of them to get your photo files.

### Step 2: Organize Your Photos

1. Create a folder structure:
   ```
   src/assets/photos/
   ```

2. Copy all your extracted photos into `src/assets/photos/`

3. Recommended organization (optional):
   ```
   src/assets/photos/
   ├── photo-001.jpg
   ├── photo-002.jpg
   ├── photo-003.jpg
   └── ... (all 160+ photos)
   ```

### Step 3: Update Gallery Code

Open `src/pages/Gallery.tsx` and replace the placeholder image generation with your actual photos:

```typescript
// Replace the generatePlaceholderImages function with:
const importAllPhotos = () => {
  // This will automatically import all images from the photos folder
  const photos = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,gif,webp}', { 
    eager: true 
  });
  
  return Object.entries(photos).map(([path, module]: [string, any], index) => ({
    src: module.default,
    alt: `Memory ${index + 1}`,
    caption: `Beautiful moment #${index + 1}`, // Customize these captions!
  }));
};

// Then in your component:
const [images, setImages] = useState(importAllPhotos());
```

### Step 4: Add Background Music (Optional)

1. Find a gentle, emotional instrumental track
2. Convert it to MP3 format
3. Place it in: `public/music.mp3`
4. The music player button will automatically work!

### Step 5: Customize Captions (Optional)

Edit `src/pages/Memories.tsx` to add personal captions to featured photos.

### Quick Tips:

- **Image formats supported**: JPG, JPEG, PNG, GIF, WEBP
- **Recommended size**: Images will be automatically optimized, but keeping them under 2MB each is ideal
- **Naming**: Use simple, sequential names like `photo-001.jpg`, `photo-002.jpg` for easier management
- **Lazy loading**: Already implemented - photos load as you scroll!

### Need Help?

The website is fully functional with placeholder images. Once you add your photos following the steps above, they'll automatically appear in the gallery!

---

**Made with 💖 for someone special**
