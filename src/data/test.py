import csv

leetcode_file = "./leetcode.csv"
solutions_file = "./output_solutions.csv"
output_file = "./merged_leetcode_solutions.csv"

# Read solutions into a dictionary
solutions = {}
with open(solutions_file, "r", newline="", encoding="utf-8") as f_solutions:
    reader = csv.reader(f_solutions)
    next(reader)  # Skip header
    for row in reader:
        problem_id = row[0].strip('"')  # Remove quotes around problem_id
        solution = row[1]  # Keep the solution intact
        solutions[problem_id] = solution

# Merge files
with open(leetcode_file, "r", newline="", encoding="utf-8") as f_leetcode, \
     open(output_file, "w", newline="", encoding="utf-8") as f_output:
    reader = csv.reader(f_leetcode)
    writer = csv.writer(f_output)

    header = next(reader)
    writer.writerow(header + ["solution"])  # Add 'solution' column to header

    for row in reader:
        problem_id = row[0]
        solution = solutions.get(problem_id, "")  # Fetch solution or empty string
        writer.writerow(row + [solution])  # Append solution as last column

print(f"Merge complete. File saved to {output_file}")