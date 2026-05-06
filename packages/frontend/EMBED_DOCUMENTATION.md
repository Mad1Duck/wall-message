# Embed Widgets Documentation

Embed Wall Message widgets on your website to allow users to send messages or display messages from walls and mini walls.

## Available Embed Types

### 1. Send Message to Wall
Form widget for sending messages to a specific wall.

**URL:** `/embed/form/wall`

**Parameters:**
- `wallId` (required) - The wall ID to send messages to
- `recipient` (optional) - The recipient username
- `theme` (optional) - Theme mode: `auto`, `dark`, or `light` (default: `auto`)

**Example:**
```html
<iframe 
  src="https://your-domain.com/embed/form/wall?wallId=xxx&recipient=username&theme=dark"
  width="400"
  height="500"
  frameborder="0"
></iframe>
```

### 2. Send Message to Mini Wall
Form widget for sending messages to a specific mini wall.

**URL:** `/embed/form/mini-wall`

**Parameters:**
- `wallId` (required) - The parent wall ID
- `miniWallId` (required) - The mini wall ID to send messages to
- `recipient` (optional) - The recipient username
- `theme` (optional) - Theme mode: `auto`, `dark`, or `light` (default: `auto`)

**Example:**
```html
<iframe 
  src="https://your-domain.com/embed/form/mini-wall?wallId=xxx&miniWallId=yyy&recipient=username&theme=dark"
  width="400"
  height="500"
  frameborder="0"
></iframe>
```

### 3. Display Wall Messages
Display widget for showing messages from a wall.

**URL:** `/embed/display/wall`

**Parameters:**
- `wallId` (required) - The wall ID to display messages from
- `limit` (optional) - Number of messages to display (default: 10)
- `theme` (optional) - Theme mode: `auto`, `dark`, or `light` (default: `auto`)

**Example:**
```html
<iframe 
  src="https://your-domain.com/embed/display/wall?wallId=xxx&limit=5&theme=dark"
  width="400"
  height="600"
  frameborder="0"
></iframe>
```

### 4. Display Mini Wall Messages
Display widget for showing messages from a mini wall.

**URL:** `/embed/display/mini-wall`

**Parameters:**
- `miniWallId` (required) - The mini wall ID to display messages from
- `limit` (optional) - Number of messages to display (default: 10)
- `theme` (optional) - Theme mode: `auto`, `dark`, or `light` (default: `auto`)

**Example:**
```html
<iframe 
  src="https://your-domain.com/embed/display/mini-wall?miniWallId=yyy&limit=5&theme=dark"
  width="400"
  height="600"
  frameborder="0"
></iframe>
```

## Features

- **Theme Toggle**: Each embed includes a theme toggle button (Auto/Dark/Light)
- **Responsive Design**: Widgets adapt to different screen sizes
- **Customizable**: Control number of messages displayed, theme, and more
- **Anonymous Sending**: Users can send messages anonymously or with a custom alias
- **Real-time Updates**: Messages are fetched in real-time

## Getting Wall/Mini Wall IDs

1. Go to your wall inbox
2. Open the mini wall you want to embed
3. The IDs are available in the URL or share dialog

## Styling

The embed widgets use CSS variables for theming. They will automatically adapt to the selected theme mode.

## Security

- All messages are sent through your authenticated backend
- CORS is configured to allow embedding on your domains
- Public messages only are displayed in display widgets
