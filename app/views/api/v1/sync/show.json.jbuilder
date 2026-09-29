json.key_format! camelize: :lower

record_name = @feed.resource.singularize

json.resource @feed.resource
json.items @feed.items, partial: "api/v1/sync/#{record_name}", as: record_name.to_sym
json.deleted @feed.deleted_ids
json.cursor @feed.cursor.encode
json.has_more @feed.more?
