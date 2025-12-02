#!/bin/bash
# Script to populate profile photos for test users
# This script will copy placeholder images or use existing images from a source directory

SOURCE_DIR="${1:-sample-photos}"  # Directory containing sample photos
UPLOADS_DIR="${2:-uploads}"        # Uploads directory

# Create uploads directory if it doesn't exist
mkdir -p "$UPLOADS_DIR"

# Photo mapping: user email -> photo filename
declare -A PHOTO_MAP=(
    ['alice.johnson@university.edu']='alice-profile.jpg'
    ['bob.smith@university.edu']='bob-profile.jpg'
    ['charlie.brown@university.edu']='charlie-profile.jpg'
    ['diana.prince@university.edu']='diana-profile.jpg'
    ['emma.watson@university.edu']='emma-profile.jpg'
    ['frank.miller@university.edu']='frank-profile.jpg'
    ['grace.hopper@university.edu']='grace-profile.jpg'
    ['henry.ford@university.edu']='henry-profile.jpg'
)

echo ""
echo "=== Populating Profile Photos ==="
echo "Source Directory: $SOURCE_DIR"
echo "Uploads Directory: $UPLOADS_DIR"
echo ""

COPIED=0
SKIPPED=0

for email in "${!PHOTO_MAP[@]}"; do
    TARGET_FILENAME="${PHOTO_MAP[$email]}"
    TARGET_PATH="$UPLOADS_DIR/$TARGET_FILENAME"
    
    # Check if target already exists
    if [ -f "$TARGET_PATH" ]; then
        echo "  ✓ $TARGET_FILENAME already exists (skipping)"
        ((SKIPPED++))
        continue
    fi
    
    # Try to find source file
    if [ -d "$SOURCE_DIR" ]; then
        SOURCE_FILE=$(find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | head -1)
        
        if [ -n "$SOURCE_FILE" ]; then
            # Copy from source directory
            cp "$SOURCE_FILE" "$TARGET_PATH"
            echo "  ✓ Copied $(basename "$SOURCE_FILE") -> $TARGET_FILENAME"
            ((COPIED++))
            continue
        fi
    fi
    
    # Create a placeholder text file
    cat > "$TARGET_PATH" << EOF
Placeholder image for $email
Replace this file with an actual photo named: $TARGET_FILENAME
EOF
    echo "  ⚠ Created placeholder: $TARGET_FILENAME (replace with actual photo)"
    ((COPIED++))
done

echo ""
echo "=== Summary ==="
echo "  Copied/Created: $COPIED"
echo "  Skipped (already exists): $SKIPPED"
echo ""
echo "Next steps:"
echo "  1. Replace placeholder files in $UPLOADS_DIR with actual photos"
echo "  2. Ensure photos are named exactly as shown in test-data.sql"
echo "  3. Run the test-data.sql script to link photos to profiles"
