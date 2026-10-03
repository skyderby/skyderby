json.key_format! camelize: :lower

json.partial! 'api/v1/competitions/competitor', competitor: @competitor
json.is_disqualified @competitor.is_disqualified || false
json.disqualification_reason @competitor.disqualification_reason
json.sponsor_logo_url stored_file_url(@competitor.sponsor_logo_url(:medium))
