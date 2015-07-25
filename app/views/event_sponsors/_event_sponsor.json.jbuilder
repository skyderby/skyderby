json.extract! event_sponsor, :id, :name, :website, :event_id
json.logo_url event_sponsor.logo.url(:medium)
