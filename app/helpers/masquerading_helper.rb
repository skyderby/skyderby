module MasqueradingHelper
  def masquerading?
    session[:admin_id].present?
  end
end
