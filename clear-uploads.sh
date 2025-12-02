#!/bin/bash
# Script to clear all uploaded files from the uploads directory
# This will delete all files in the uploads folder

UPLOADS_DIR="uploads"

if [ -d "$UPLOADS_DIR" ]; then
    echo "Clearing all files from $UPLOADS_DIR..."
    
    COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    
    if [ "$COUNT" -gt 0 ]; then
        find "$UPLOADS_DIR" -type f -delete
        echo "Deleted $COUNT file(s) from $UPLOADS_DIR"
    else
        echo "No files found in $UPLOADS_DIR"
    fi
else
    echo "Uploads directory not found. Creating it..."
    mkdir -p "$UPLOADS_DIR"
    echo "Created $UPLOADS_DIR directory"
fi

echo ""
echo "Done! Uploads directory is now empty."
