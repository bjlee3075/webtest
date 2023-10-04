// queries.js

const queries = {
    data15_1: `
        SELECT
            to_date(시점, 'YYYYMM') as 시점,
            전년동월비
        FROM
            (SELECT 
                prd_de as 시점,
                ((cast(dt as numeric) - LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) / LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) * 100 as 전년동월비
            FROM
                "1170101_DT_1J20003"
            WHERE
                to_date(prd_de, 'YYYYMM') >= '2009-01-01'
            ) a
        WHERE
            to_date(시점, 'YYYYMM') BETWEEN $1 AND $2
        ORDER BY 시점
    `,
    data15_2: `
        SELECT
            to_date(시점, 'YYYYMM') as 시점,
            전년동월비
        FROM
            (SELECT 
                prd_de as 시점,
                ((cast(dt as numeric) - LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) / LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) * 100 as 전년동월비
            FROM
                "1170101_DT_1J20007"
            WHERE
                to_date(prd_de, 'YYYYMM') >= '2009-01-01'
            ) a
        WHERE
            to_date(시점, 'YYYYMM') BETWEEN $1 AND $2
        ORDER BY 시점    
    `,
    data16_1: `
        WITH monthly_data 
        AS 
        (SELECT 
            date_trunc('month', to_date(날짜, 'YYYY-MM-DD')) as month,
            max(날짜) as last_day_of_month
        FROM
            "1162501_1001"
        WHERE
            날짜 >= '2007-01-01'
        GROUP BY
            month
        )
        SELECT 
            cast(date_trunc('month', to_date(시점, 'YYYY-MM-DD')) as date) as 시점,
            전년동월비
        FROM
            (SELECT 
                t.날짜 as 시점,
                ((cast(t.종가 as float) - lag(cast(t.종가 as float), 12) over (order by t.날짜)) / 
                lag(cast(t.종가 as float), 12) over (order by t.날짜)) * 100 as 전년동월비
            FROM 
                "1162501_1001" t
            INNER JOIN
                monthly_data m ON t.날짜 = m.last_day_of_month
        ) a               
        WHERE
            to_date(a.시점,'YYYY-MM-DD') >= '2008-01-01' 
        AND	to_date(a.시점,'YYYY-MM-DD') < date_trunc('month', current_date)
        ORDER BY 시점
    `,
    data16_2: `
        SELECT
            to_date(CPI.시점, 'YYYYMM') as 시점,
            cast(CEI.dt as numeric) - CPI.전년동월비 as "선행물가"
        FROM	
            (SELECT 
                prd_de as 시점,
                ((cast(dt as numeric) - LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) / LAG(cast(dt as numeric), 12) OVER (ORDER BY prd_de)) * 100 as 전년동월비
            FROM
                "1170101_DT_1J20003"
            WHERE
                to_date(prd_de, 'YYYYMM') >= '2007-01-01'
            ) CPI,
            "1170101_DT_1C8015" CEI
        WHERE
            CPI.시점 = CEI.prd_de
        AND	CEI.c1 = 'A05'
        AND	CPI.시점 >= '200801'
        ORDER BY to_date(CPI.시점, 'YYYYMM')
    `
};

module.exports = queries;
