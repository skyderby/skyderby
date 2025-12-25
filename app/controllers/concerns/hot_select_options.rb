module HotSelectOptions
  extend ActiveSupport::Concern

  private

  def respond_with_no_results(frame_id)
    render partial: 'hot_select/no_results', locals: { frame_id: frame_id }
  end
end
