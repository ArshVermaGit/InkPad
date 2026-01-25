// Centralized Editor Constants

// Available Handwriting Fonts
export const EDITOR_FONTS = [
    { name: 'Caveat', label: 'Real Handwriting' },
    { name: 'Homemade Apple', label: 'Messy Apple' },
    { name: 'Indie Flower', label: 'Indie Flower' },
    { name: 'Gloria Hallelujah', label: 'Gloria' },
    { name: 'Reenie Beanie', label: 'Beanie' },
    { name: 'Shadows Into Light', label: 'Shadows' },
    { name: 'Patrick Hand', label: 'Patrick' },
    { name: 'Kalam', label: 'Kalam' },
];

// Ink Colors
export const EDITOR_COLORS = [
    { name: 'Blue Ink', value: '#1e3a8a' },
    { name: 'Black Ink', value: '#171717' },
    { name: 'Red Ink', value: '#991b1b' },
    { name: 'Green Ink', value: '#166534' },
    { name: 'Pencil', value: '#4b5563' },
    { name: 'Charcoal', value: '#262626' },
];

// Paper Types
export const EDITOR_PAPERS = [
    { id: 'plain', name: 'Plain White', css: 'bg-white', lineHeight: 32 },
    { 
        id: 'lined', 
        name: 'Lined Paper', 
        css: 'bg-white', 
        lineHeight: 32, 
        style: { 
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', 
            backgroundSize: '100% 32px' 
        } 
    },
    { 
        id: 'grid', 
        name: 'Graph Paper', 
        css: 'bg-white', 
        lineHeight: 25,
        style: {
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '25px 25px'
        }
    },
    {
        id: 'midnight',
        name: 'Midnight',
        css: 'bg-neutral-900',
        lineHeight: 32,
        style: {
            backgroundImage: 'linear-gradient(#404040 1px, transparent 1px)',
            backgroundSize: '100% 32px'
        }
    }
];
