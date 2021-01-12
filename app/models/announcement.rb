require 'kramdown'

class Announcement < ApplicationRecord
  validates :name, :text, :period_from, :period_to, presence: true

  scope :active, -> { where('NOW() BETWEEN period_from AND period_to') }

  def to_html = Kramdown::Document.new(text).to_html
end
