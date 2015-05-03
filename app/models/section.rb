class Section < ActiveRecord::Base
  belongs_to :event

  validates_presence_of :name
  validates_presence_of :event

  before_create :set_order

  private

  def set_order
    # Для классов в соревновании устанавливается порядок для возможности ручной
    # сортировки
    sections = Section.where(event_id: event_id).to_a
    cur_max_order = sections.map{ |x| x.order }.max || 0 

    self.order = cur_max_order + 1
  end
end
