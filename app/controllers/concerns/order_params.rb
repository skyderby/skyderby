module OrderParams
  extend ActiveSupport::Concern

  included do
    helper_method :order_params
  end

  def order_params
    order = params[:order].to_s
    return [nil, nil] if order.blank?

    if order[0] == '-'
      [order[1..], :desc]
    else
      [order, :asc]
    end
  end
end
