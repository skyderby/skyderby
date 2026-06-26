class FreeProViewTrackingJob < ApplicationJob
  def perform(free_pro_view_id)
    FreeProView.find(free_pro_view_id).track_amplitude_events
  end
end
