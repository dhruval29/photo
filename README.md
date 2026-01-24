# Photo Flipbook

A modern, aesthetic photo flipbook for the web with smooth page-turning animations.

## Features

- **Landscape Orientation**: Optimized for landscape viewing with 4:3 aspect ratio
- **Smooth Animations**: Realistic page-flip physics using StPageFlip library
- **Minimal UI**: Clean, modern controls that stay out of the way
- **Responsive**: Scales beautifully across desktop and tablet devices
- **Touch & Mouse**: Full support for both input methods
- **Keyboard Navigation**: Use arrow keys to navigate (← →)
- **Dark Mode**: Automatically adapts to system color scheme preferences
- **Optional Captions**: Subtle captions that appear on hover
- **Lightweight**: ~15KB total (excluding images), uses CDN for library

## Project Structure

```
final/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # All styling (variables, responsive, animations)
├── js/
│   └── app.js          # Flipbook logic and initialization
└── README.md           # This file
```

## Quick Start

1. Open `index.html` in a modern browser
2. Replace the sample photos in `js/app.js` with your own:

```javascript
const photos = [
    {
        url: 'path/to/your/image1.jpg',
        caption: 'Optional caption'
    },
    // Add more photos...
];
```

3. That's it! The flipbook will automatically adjust to your images.

## Customization

### Colors & Theme

Edit CSS variables in `css/style.css`:

```css
:root {
    --bg-color: #f5f5f5;
    --text-color: #333;
    --control-bg: rgba(255, 255, 255, 0.95);
    /* ... */
}
```

### Page Dimensions

Modify the aspect ratio in `js/app.js` (line 131):

```javascript
const aspectRatio = 4 / 3; // Change to 16/9, 3/2, etc.
```

### Animation Settings

Adjust StPageFlip parameters in `js/app.js` (line 147):

```javascript
flippingTime: 1000,     // Duration of flip animation
swipeDistance: 30,       // Sensitivity for swipe gestures
showPageCorners: true,   // Show curled page corners
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance Notes

- Images are lazy-loaded for faster initial load
- Uses hardware-accelerated CSS transforms
- Debounced resize handler prevents layout thrashing
- Minimal DOM manipulation during flips

## Key Technical Decisions

1. **StPageFlip in HTML mode**: More flexible than canvas mode, better for images with captions
2. **CSS Variables**: Easy theming and dark mode support
3. **Vanilla JS**: No framework overhead, faster load times
4. **CDN for library**: Reduces bundle size, leverages browser cache
5. **Aspect ratio calculation**: Maintains proportions across all screen sizes
6. **Backdrop filter**: Modern blur effect on controls (graceful degradation in older browsers)

## Adding Your Own Images

### Option 1: Local Images
Place images in a folder (e.g., `images/`) and update the paths:

```javascript
const photos = [
    { url: 'images/photo1.jpg', caption: 'My Photo' },
    // ...
];
```

### Option 2: Remote Images
Use full URLs (as demonstrated with Unsplash in the demo):

```javascript
const photos = [
    { url: 'https://example.com/photo.jpg', caption: 'Remote Photo' },
    // ...
];
```

## License

Free to use for personal and commercial projects.

## Credits

- Page-flip animations: [StPageFlip](https://github.com/Nodlik/StPageFlip)
- Demo images: [Unsplash](https://unsplash.com)
