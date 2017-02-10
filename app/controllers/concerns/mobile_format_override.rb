module MobileFormatOverride
  extend ActiveSupport::Concern

  included do
    before_action :prepare_mobile, :override_format_if_mobile

    append_view_path MobileFallbackResolver.new('app/views')

    helper_method :mobile_device?
    helper_method :mobile?
  end

  def prepare_mobile
    session[:mobile] = params[:mobile] || '1'
  end

  def override_format_if_mobile
    request.format = :mobile if mobile?
  end

  def mobile_device?
    DetectVariantService.new(request.user_agent).mobile?
  end

  def mobile?
    mobile_device? && session[:mobile] == '1'
  end
end
