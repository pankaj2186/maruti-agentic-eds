# Employee Table

Displays a searchable employee list in a table with columns for Employee Code, Employee Name, Designation Code, and Designation Description. Selecting a row stores the employee code as the field value.

## How to Use

1. Add the component to your form with `fd:viewType` set to `employee-table`.
2. Set the **Data Endpoint URL** in the authoring dialog to a JSON endpoint that returns an array of employee objects.

## Authoring Properties

| Property | Type | Description |
|----------|------|-------------|
| `dataEndpoint` | text | URL to a JSON endpoint returning employee data (see format below) |
| `searchPlaceholder` | text | Placeholder text for the search box (default: `Search employees...`) |

## API Response Format

The `dataEndpoint` must return a JSON array (or an object with an `employees` array):

```json
[
  {
    "empCode": "EMP1072",
    "empName": "MONALI SOPAN MAZIRE",
    "desgCode": "TL",
    "desgDesc": "Team Leader"
  }
]
```

## Model Properties Set

| Property | When set |
|----------|----------|
| `value` | Set to `empCode` of the selected row when the user clicks a row |

## Usage Notes

- Base type: `text-input` (`fd:viewType`: `employee-table`)
- The underlying `<input>` is hidden; the selected employee code is written to it and a `change` event is dispatched so form rules can react.
- Filtering is case-insensitive and matches across all four columns.
- The table scrolls independently (max height 320 px) to keep the rest of the form visible.
