require 'competitions/skydive_comp_range_finder'

class SkydiveResultProcessor
  def initialize(track_id, params)
    @track = Track.find(track_id)
        
    validate! params 
    @range_from = params[:range_from]
    @range_to = params[:range_to]

    @comp_window = SkydiveCompRange.for(@track, @range_from, @range_to) 
  end

  def calculate
    0
  end

  private

  def validate!(params)
    raise ArgumentError.new('Params should be the hash') unless params.is_a? Hash
    raise ArgumentError.new('Params should contain range_from') unless params[:range_from]
    raise ArgumentError.new('Params should contain range_to') unless params[:range_to]
  end
end
