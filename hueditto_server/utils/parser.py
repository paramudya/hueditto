import re

def parse_sql(text):
    pattern = r'(?i:SELECT|WITH)(?:[^;`]|`(?!``))*(?:;|```)'
    query_candidates = re.findall(pattern, text, re.DOTALL | re.MULTILINE)
    if len(query_candidates) == 0:
        return 'no queries'
    else:
        the_query = query_candidates[0]
        return the_query.replace('```','')