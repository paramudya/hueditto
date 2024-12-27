import re
from utils.parser import parse_sql
from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Get API key
openai_api = os.getenv('OPENAI_API_KEY')

def openai_call(user_prompt: str, 
                model: str = 'gpt-4o',
                system_prompt: str = 'You are to fix an SQL query based on the given error. You only generate the SQL query.'
                ) -> str:
    ope_client = OpenAI(api_key=openai_api) # prolly not the most efficient way to initiate everytime a prompt called

    completion = ope_client.chat.completions.create(
    model=model,
    temperature=0,
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    ).choices[0].message.content
    return completion

def llm_call(model: str, prompt: str) -> str:
    if model == 'gpt-4o':
        ans = openai_call(prompt)
    
    return ans

def sqlol(sql_query: str, error: str) -> str:
    """
    Args:
        sql_query (str): SQL query string to be fixed
    Returns:
        str: Fixed SQL query
    """
    prompt = f'''query: {sql_query}, error: {error}'''
     
    full_ans = llm_call('gpt-4o', prompt)
    print('full ans:', full_ans)
    fixxx = parse_sql(full_ans)

    return fixxx

def sqlint(sql_query: str) -> str:
    """
    SQLinter for: capitalization, indentation and line breaks.
    
    Args:
        sql_query (str): Fixed SQL query string
    Returns:
        str: Formatted SQL query
    """
    # Remove extra whitespace
    sql = ' '.join(sql_query.split())
    
    # Major keywords that should start new lines
    major_keywords = [
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 
        'ORDER BY', 'LIMIT', 'UPDATE', 'DELETE', 'INSERT', 
        'CREATE', 'DROP', 'ALTER', 'WITH'
    ]
    
    # Keywords that should start new lines with indentation
    subquery_keywords = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN']
    
    # Logical operators that should start new lines with indentation
    logical_keywords = ['AND', 'OR']
    
    # Capitalize major keywords
    for keyword in major_keywords + subquery_keywords + logical_keywords:
        pattern = r'\b' + keyword.replace(' ', r'\s+') + r'\b'
        sql = re.sub(pattern, keyword, sql, flags=re.IGNORECASE)
    
    # Add newlines before major keywords
    for keyword in major_keywords:
        sql = sql.replace(keyword, f'\n{keyword}')
    
    # Add newlines and indentation before subqueries
    for keyword in subquery_keywords:
        sql = sql.replace(keyword, f'\n  {keyword}')
    
    # Add newlines and indentation before logical operators
    for keyword in logical_keywords:
        sql = sql.replace(f' {keyword} ', f'\n  {keyword} ')
    
    # Handle parentheses indentation
    lines = sql.strip().split('\n')
    formatted_lines = []
    indent_level = 0
    
    for line in lines:
        line = line.strip()
        
        # Decrease indent for closing parenthesis
        if line.startswith(')'):
            indent_level = max(0, indent_level - 1)
            
        # Add proper indentation
        formatted_line = '  ' * indent_level + line
        formatted_lines.append(formatted_line)
        
        # Increase indent for opening parenthesis
        if line.endswith('('):
            indent_level += 1
        
        # Handle same-line parentheses
        indent_level += line.count('(') - line.count(')')
        indent_level = max(0, indent_level)
    
    return '\n'.join(formatted_lines).strip()