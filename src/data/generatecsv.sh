#!/bin/bash

# Define the output CSV file
output_csv="./output_solutions.csv"

# Write CSV header
echo "problem_id,contents" > "$output_csv"

# Loop through all directories in the 'solutions' directory
for dir in ./solutions/*/; do
  # Extract the directory name
  dirname=$(basename "$dir")

  # Extract digits before the '.' in the directory name (problem ID)
  if [[ $dirname =~ ^([0-9]+)\. ]]; then
    problem_id=${BASH_REMATCH[1]}

    # Locate the .py file in the directory (first one found)
    py_file=$(find "$dir" -maxdepth 1 -name "*.py" | head -n 1)

    # Fallback: If no .py file, grab the first file in the directory
    if [[ -z $py_file ]]; then
      py_file=$(find "$dir" -maxdepth 1 -type f | head -n 1)
    fi

    if [[ -f $py_file ]]; then
      # Read and escape the contents of the file: replace newlines with "\n" and escape quotes
      py_contents=$(awk '{gsub(/"/, "\"\""); print}' "$py_file" | sed ':a;N;$!ba;s/\n/\\n/g')

      # Append the problem ID and contents to the CSV file
      echo "\"$problem_id\",\"$py_contents\"" >> "$output_csv"
    else
      echo "No file found in $dir"
    fi
  else
    echo "Skipping non-matching directory: $dirname"
  fi
done

echo "CSV generation complete. File saved to $output_csv"