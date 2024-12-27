const SQLHighlighter = {
    highlight: function(sql) {
        // First decode ALL HTML entities at once using a temporary element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sql;
        sql = tempDiv.textContent;

        // Now the string is completely decoded, continue with highlighting
        const keywords = [
            'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
            'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE',
            'DELETE', 'CREATE', 'ALTER', 'DROP', 'AND', 'OR', 'IN', 'BETWEEN',
            'LIKE', 'IS', 'NULL', 'NOT', 'ASC', 'DESC', 'AS'
        ];

        const aggregates = [
            'SUM', 'COUNT', 'AVG', 'AVERAGE', 'MIN', 'MAX', 'MEDIAN', 
            'STDDEV', 'VARIANCE', 'FIRST', 'LAST', 'GROUP_CONCAT',
            'PERCENTILE_CONT', 'PERCENTILE_DISC', 'LISTAGG', 'ARRAY_AGG',
            'STRING_AGG', 'COALESCE', 'NVL'
        ];

        // Escape HTML after complete decoding
        let highlighted = sql.replace(/[&<>'"]/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&quot;',
            '"': '&quot;'
        }[char]));

        // Rest of the highlighting logic remains the same
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlighted = highlighted.replace(regex, match => 
                `<span class="sql-keyword">${match}</span>`
            );
        });

        aggregates.forEach(agg => {
            const regex = new RegExp(`\\b${agg}\\s*\\(`, 'gi');
            highlighted = highlighted.replace(regex, match => 
                `<span class="sql-aggregate">${match}</span>`
            );
        });

        highlighted = highlighted.replace(/'[^']*'/g, match => 
            `<span class="sql-string">${match}</span>`
        );
        
        highlighted = highlighted.replace(/\b\d+\b/g, match => 
            `<span class="sql-number">${match}</span>`
        );
        
        highlighted = highlighted.replace(/--.*$/gm, match => 
            `<span class="sql-comment">${match}</span>`
        );

        return highlighted;
    }
};