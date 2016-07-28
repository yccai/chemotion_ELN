class UpdateMolecule < ActiveRecord::Migration
  def change
    Molecule.reset_column_information
    add_column :molecules, :fingerprint_id, :integer

    Molecule.reset_column_information
    # Extract all molecule
    Molecule.all.each do |molecule|
      if molecule.samples.count == 0
        fp_vector = Chemotion::OpenBabelService.fingerprint_from_molfile(molecule.molfile)
      else
        fp_vector = Chemotion::OpenBabelService.fingerprint_from_molfile(molecule.samples.first.molfile)
      end

      old_fp = Fingerprint.where("fp0  & ? = ?", "%064b" % fp_vector[0], "%064b" % fp_vector[0])
      (1..15).each do |i|
        old_fp = old_fp.where("fp#{i}  & ? = ?",
                              "%064b" % fp_vector[i],
                              "%064b" % fp_vector[i])
      end

      if old_fp.count == 0
        fp = Fingerprint.create()
      else
        fp = old_fp.first
      end

      fp.fp0  = "%064b" % fp_vector[0]
      fp.fp1  = "%064b" % fp_vector[1]
      fp.fp2  = "%064b" % fp_vector[2]
      fp.fp3  = "%064b" % fp_vector[3]
      fp.fp4  = "%064b" % fp_vector[4]
      fp.fp5  = "%064b" % fp_vector[5]
      fp.fp6  = "%064b" % fp_vector[6]
      fp.fp7  = "%064b" % fp_vector[7]
      fp.fp8  = "%064b" % fp_vector[8]
      fp.fp9  = "%064b" % fp_vector[9]
      fp.fp10 = "%064b" % fp_vector[10]
      fp.fp11 = "%064b" % fp_vector[11]
      fp.fp12 = "%064b" % fp_vector[12]
      fp.fp13 = "%064b" % fp_vector[13]
      fp.fp14 = "%064b" % fp_vector[14]
      fp.fp15 = "%064b" % fp_vector[15]

      query_num_set_bits = 0

      fp_vector.each do |fp|
        num_bit_on = ("%064b" % fp).count("1")
        query_num_set_bits = query_num_set_bits + num_bit_on
      end

      fp.num_set_bits = query_num_set_bits
      fp.save!

      molecule.fingerprint_id = fp.id
      molecule.save!
    end
  end
end
