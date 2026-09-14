module MobileFormatOverride
  extend ActiveSupport::Concern

  included do
    helper_method :mobile?, :mobile_app?
  end

  def mobile?
    browser.device.mobile? || mobile_app? || mobile_param?
  end

  def mobile_app?
    browser.ua.start_with? 'turbolinks-view'
  end

  def mobile_param?
    params[:mobile] == '1'
  end
end
