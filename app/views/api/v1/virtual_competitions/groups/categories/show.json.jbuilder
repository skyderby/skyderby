json.key_format! camelize: :lower

json.partial! 'api/v1/virtual_competitions/groups/category', category: @category, rows: @category.rows_on_page
