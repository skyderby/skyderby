require 'competitions/skydive_comp_range_finder'

class SkydiveResultProcessor
  def initialize(track_points, params)
    @track_points = track_points

    validate! params
    @range_from = params[:range_from]
    @range_to = params[:range_to]

    @comp_window = SkydiveCompRange.for(@track_points, @range_from, @range_to)
  end

  def calculate
    0
  end

  private

  def validate!(params)
    fail ArgumentError.new('Params should be the hash') unless params.is_a? Hash
    fail ArgumentError.new('Params should contain range_from') unless params[:range_from]
    fail ArgumentError.new('Params should contain range_to') unless params[:range_to]
  end
end
