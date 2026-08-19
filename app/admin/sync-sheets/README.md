# Google Sheets Sync Documentation

This system allows you to import questions from Google Sheets into your quiz game database dynamically.

## Setup Instructions

### 1. Prepare Your Google Sheet

Your Google Sheet should be structured with columns for:
- **Date**: The date for the question (any standard date format)
- **Question**: The question text
- **Answers**: Multiple columns containing possible answers

Example structure:
```
| Date       | Question                    | Answer 1 | Answer 2 | Answer 3 | ...
|------------|-----------------------------|---------:|----------|---------:|
| 2024-01-15 | Name the Six Nations teams  | Ireland  | England  | France   | ...
| 2024-01-16 | GAA All-Ireland winners     | Kerry    | Dublin   | Tyrone   | ...
```

### 2. Make Your Sheet Public

1. Open your Google Sheet
2. Click "Share" in the top right
3. Change access to "Anyone with the link can view"
4. Copy the share link

### 3. Configure the Sync

Visit `/admin/sync-sheets` and configure:

- **Game Type**: Select which game the questions are for
- **Spreadsheet URL**: Paste your Google Sheets URL
- **Sheet Name**: The name of the tab (e.g., "Sheet1")
- **Date Column**: Column letter for dates (e.g., "A")
- **Question Column**: Column letter for questions (e.g., "B")
- **Answers Start Column**: First column with answers (e.g., "C")
- **Answers End Column**: Last column with answers (e.g., "L")
- **Skip Rows**: Number of header rows to skip (usually 1)
- **Update Existing**: Check to overwrite existing questions

### 4. Preview and Sync

1. Click "Preview Questions" to see what will be imported
2. Review the preview data
3. Click "Sync Questions" to import into database

## Column Configuration

The system uses column letters (A, B, C, etc.) to identify data:

- **A** = First column
- **B** = Second column
- **Z** = 26th column
- **AA** = 27th column

### Example Configuration

For a sheet structured like:
```
A: Date | B: Question | C-L: Answers (10 columns)
```

Configuration would be:
- Date Column: `A`
- Question Column: `B`
- Answers Start: `C`
- Answers End: `L`

## Date Formats

The system accepts various date formats:
- `2024-01-15`
- `01/15/2024`
- `15-Jan-2024`
- `January 15, 2024`

All dates are converted to `YYYY-MM-DD` format for storage.

## Sync Behavior

- **New Questions**: Added to database
- **Existing Questions** (same date):
  - If "Update Existing" is checked: Updated with new data
  - If unchecked: Skipped

## Troubleshooting

### "Failed to fetch sheet data"
- Ensure the sheet is publicly accessible
- Check the spreadsheet ID is correct
- Verify the sheet name matches exactly

### "No questions found"
- Check column configuration
- Verify date format is valid
- Ensure questions and answers are not empty

### "Invalid date"
- Check date column has valid dates
- Empty date cells will skip that row

## API Integration

You can also use the sync programmatically:

```typescript
import { syncQuestionsFromSheet } from '@/app/admin/sync-sheets/actions'

const result = await syncQuestionsFromSheet(
  'rugby-tenable',
  {
    spreadsheetId: '1UlC8R0eDycz2K5lm3s0BySZDfmFUfybgv9MlpLZs2jc',
    sheetName: 'Sheet1',
    dateColumn: 'A',
    questionColumn: 'B',
    answersStartColumn: 'C',
    answersEndColumn: 'L',
    skipRows: 1,
  },
  false // updateExisting
)

console.log(result.message)
```

## Best Practices

1. **Regular Syncs**: Run sync regularly to keep questions up-to-date
2. **Preview First**: Always preview before syncing
3. **Backup**: Keep a backup of your sheet
4. **Date Uniqueness**: Each date should have only one question
5. **Answer Quality**: Remove empty answer cells from sheet
