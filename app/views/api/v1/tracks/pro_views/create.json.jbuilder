json.key_format! camelize: :lower

json.status @status
json.free_pro_views { json.partial! 'api/v1/shared/free_pro_views', user: current_user }
json.pro_view_available @track.pro_view_available?
