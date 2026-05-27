# Invenio Bulk Importer

A modern React component library for Invenio bulk import functionality, built with TypeScript, PandaCSS, and Semantic UI React.

## Overview

This library provides a comprehensive set of React components for managing bulk imports in Invenio applications. It includes features for task management, file uploads, metadata processing, search functionality, and progress tracking with a modern, responsive interface.

## Features

- 📦 **Bulk Import Management**: Create, manage, and execute bulk import tasks
- 📁 **File Upload**: Advanced file uploader with drag-and-drop support
- 🔍 **Search & Filter**: Powerful search with faceted filtering
- 📊 **Progress Tracking**: Progress monitoring with visual feedback
- 📋 **Task Details**: Comprehensive task management with detailed views
- ♿ **Accessibility**: Semantic HTML with proper ARIA support

## Installation

```bash
# Using yarn (recommended)
yarn add @ubiquitypress/react-invenio-bulk-importer

# Using npm
npm install @ubiquitypress/react-invenio-bulk-importer
```

## Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
yarn add react react-dom semantic-ui-react semantic-ui-css react-invenio-forms
```

## Quick Start

### Search Interface

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { BulkImporter } from "@ubiquitypress/react-invenio-bulk-importer";
import "@ubiquitypress/react-invenio-bulk-importer/style.css";

const BulkImporterSearchApp = () => {
  return <BulkImporter.Search />;
};

const initializeBulkImporter = () => {
  const domContainer = document.getElementById("invenio-search-config");
  
  if (!domContainer) {
    console.error("Could not find element with id 'invenio-search-config'");
    return;
  }

  ReactDOM.render(<BulkImporterSearchApp />, domContainer);
};

initializeBulkImporter();
```

### Task Details Interface

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { BulkImporter } from "@ubiquitypress/react-invenio-bulk-importer";
import "@ubiquitypress/react-invenio-bulk-importer/style.css";

const BulkImporterDetailsApp = ({ taskId }) => {
  return <BulkImporter.TaskDetails taskId={taskId} />;
};

const initializeBulkImporterDetails = () => {
  const domContainer = document.getElementById("invenio-details-config");
  
  if (!domContainer) {
    console.error("Could not find element with id 'invenio-details-config'");
    return;
  }

  // Extract data from DOM attributes
  const taskId = JSON.parse(domContainer.dataset.pid);

  ReactDOM.render(<BulkImporterDetailsApp taskId={taskId} />, domContainer);
};

initializeBulkImporterDetails();
```

## HTML Integration

This library is designed to integrate with Invenio's template system.

The `data-pid` attribute should contain a task ID that will be parsed by the component.

## Components

### Core Components

The library exposes components through the `BulkImporter` namespace:

#### `<BulkImporter.Search />`
Complete search interface with task listing, filtering, and management capabilities.

```jsx
import { BulkImporter } from '@ubiquitypress/react-invenio-bulk-importer';

<BulkImporter.Search />
```

#### `<BulkImporter.TaskDetails />`
Detailed view component for individual import tasks with records, status, and management.

```jsx
import { BulkImporter } from '@ubiquitypress/react-invenio-bulk-importer';

<BulkImporter.TaskDetails taskId="task-123" />
```

#### CSV export controls
Export a single Invenio record with the bulk CSV media type:

```jsx
import { BulkImporter } from '@ubiquitypress/react-invenio-bulk-importer';

<BulkImporter.ExportRecordButton recordId="jvybz-9q277" />
```

Task record rows also expose single-record export from the row **Actions**
menu when the importer record has a generated or existing Invenio record ID.

For record search pages, enable the search export button:

```jsx
<BulkImporter.Search
  config={{
    searchApi: {
      axios: {
        url: '/api/records',
        withCredentials: true
      }
    },
    showImportModal: false,
    showExportButton: true
  }}
/>
```

By default the export request first tries
`application/vnd.inveniordm.v1.bulk+csv`. If the API returns `406 Not
Acceptable`, it falls back to InvenioRDM's built-in CSV formats:
`application/vnd.inveniordm.v1.full+csv`, then
`application/vnd.inveniordm.v1.simple+csv`.

## Styling

This library uses PandaCSS for styling, which provides:

- **Type-safe styling**: Compile-time CSS validation
- **Logical properties**: Better internationalization support
- **Responsive design**: Mobile-first responsive utilities
- **Design tokens**: Consistent spacing, colors, and typography

## Development

### Prerequisites

- Node.js 18+ 
- Yarn 4.x (recommended)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd invenio-bulk-importer-react

# Install dependencies
yarn install

# Generate PandaCSS styles
yarn prepare

# Start development server
yarn dev
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn type-check` - Run TypeScript type checking
- `yarn check` - Run linting, type checking, and dependency sync
- `yarn preview` - Preview production build

### Project Structure

```
src/
├── components/           # React components
│   ├── core/            # Main feature components
│   │   ├── bulk-importer/
│   │   ├── file-uploader/
│   │   ├── search/
│   │   └── task-details/
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── theme/               # Global styles
```

### Code Style

This project uses:

- **Biome** for linting and formatting
- **TypeScript** for type safety
- **PandaCSS** for styling
- **Semantic UI React** for base components
