json.limit FreeProView.monthly_limit
json.remaining [FreeProView.remaining_for(user), 0].max
json.resets_at Time.current.next_month.beginning_of_month.iso8601
