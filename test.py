# functions.py
import argparse
import json

def func1(data):
    return f"func1 received: {data}"

def func2(data):
    return f"func2 received: {data}"

def main():
    parser = argparse.ArgumentParser(description="Run specific function with data.")
    parser.add_argument('function_name', type=str, help='Function to run')
    parser.add_argument('data', type=str, help='Data to pass to function')
    args = parser.parse_args()

    # Data conversion if necessary
    data = json.loads(args.data)

    # Function mapping
    functions = {
        'func1': func1,
        'func2': func2
    }

    # Call the function
    if args.function_name in functions:
        result = functions[args.function_name](data)
        print(result)
    else:
        print(f"No function named {args.function_name} found.")

if __name__ == "__main__":
    main()
