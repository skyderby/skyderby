<<<<<<< HEAD
class ChangeColumnTypeInCompetitor < ActiveRecord::Migration
  def change
    #remove_reference :competitors, :participatable
    add_reference :competitors, :participation_forms
  end
end
=======
class ChangeColumnTypeInCompetitor < ActiveRecord::Migration
  def change
    remove_reference :competitors, :participatable
    add_reference :competitors, :participation_forms
  end
end
>>>>>>> 1dc6281dae4443bfe1ecabff0b010ed140eb7920
