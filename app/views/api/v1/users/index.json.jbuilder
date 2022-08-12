json.extract! @users, :current_page, :total_pages

json.items @users do |user|
  json.extract! user, :id, :email, :name, :sign_in_count, :created_at
  json.confirmed user.confirmed_at.present?
  json.oauth user.provider.present?
end
