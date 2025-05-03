import argparse
import os
import glob
import time
import win32com.client


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--blank',      required=True, help='Path to blank master PPTX')
    p.add_argument('--hymnFolder', required=True, help='Folder containing hymn PPTX files')
    p.add_argument('--opening',    required=True, help='3-digit code for opening hymn')
    p.add_argument('--between',    required=True, help='3-digit code for between-lessons hymn')
    p.add_argument('--bday',       required=True, help='3-digit code for birthday hymn')
    p.add_argument('--offertory',  required=True, help='3-digit code for offertory hymn')
    p.add_argument('--confession', required=True, help='3-digit code for confession hymn')
    p.add_argument('--communion',  required=True, help='Comma-separated 3-digit codes for communion hymns')
    p.add_argument('--doxology',   required=True, help='Slide number (1–10) for doxology in Doxologies.pptx')
    return p.parse_args()


def open_ppt(app, path):
    return app.Presentations.Open(path, WithWindow=False)


def insert_slides(app, master, hymn_file, insert_index):
    hymn_pres = open_ppt(app, hymn_file)
    count = hymn_pres.Slides.Count
    for i in range(1, count + 1):
        hymn_pres.Slides(i).Copy()
        time.sleep(0.5)  # let clipboard populate

        pasted = False
        for attempt in range(5):
            try:
                master.Slides.Paste(Index=insert_index)
                pasted = True
                break
            except Exception:
                time.sleep(0.5)

        if not pasted:
            hymn_pres.Close()
            raise RuntimeError(f"Failed to paste slide {i} from {hymn_file} after 5 attempts.")

        insert_index += 1

    hymn_pres.Close()
    return count


def run(args):
    app = win32com.client.Dispatch('PowerPoint.Application')
    app.Visible = True

    master = open_ppt(app, args.blank)
    offset = 0

    def find(code):
        pattern = os.path.join(args.hymnFolder, f"{code} -*.pptx")
        files = glob.glob(pattern)
        if not files:
            raise FileNotFoundError(f"No hymn file matching {pattern}")
        return files[0]

    idx = 3 + offset
    offset += insert_slides(app, master, find(args.opening), idx)

    idx = 4 + offset
    offset += insert_slides(app, master, find(args.between), idx)

    idx = 59 + offset
    offset += insert_slides(app, master, find(args.bday), idx)

    idx = 60 + offset
    offset += insert_slides(app, master, find(args.offertory), idx)

    idx = 63 + offset
    offset += insert_slides(app, master, find(args.confession), idx)

    idx = 138 + offset
    for code in args.communion.split(','):
        hymn_file = find(code.strip())
        inserted = insert_slides(app, master, hymn_file, idx)
        offset += inserted
        idx += inserted

    dox_file = os.path.join(args.hymnFolder, 'Doxologies.pptx')
    if not os.path.exists(dox_file):
        raise FileNotFoundError(f"Doxology file not found at {dox_file}")
    dox_pres = open_ppt(app, dox_file)
    slide_num = int(args.doxology) + 1
    if slide_num < 2 or slide_num > dox_pres.Slides.Count:
        dox_pres.Close()
        raise ValueError("Doxology slide number out of range (must map to slide 2–n)")
    dox_pres.Slides(slide_num).Copy()
    time.sleep(0.5)

    pasted = False
    for attempt in range(5):
        try:
            master.Slides.Paste(Index=159 + offset)
            pasted = True
            break
        except Exception:
            time.sleep(0.5)

    if not pasted:
        dox_pres.Close()
        raise RuntimeError("Failed to paste doxology slide after 5 attempts.")

    dox_pres.Close()

    out_path = os.path.join(os.path.dirname(args.blank), 'updated_master.pptx')
    master.SaveAs(out_path)
    master.Close()
    print("Saved ->", out_path)


if __name__ == '__main__':
    args = parse_args()
    run(args)
