json.extract! event,
              :id,
              :name,
              :rules,
              :range_from,
              :range_to,
              :status,
              :place,
              :responsible,
              :wind_cancellation

json.starts_at event.starts_at.strftime('%d.%m.%Y')
