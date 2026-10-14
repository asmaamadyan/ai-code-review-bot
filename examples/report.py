def add_report(report, reports=[]):
    reports.append(report)
    return reports


def read_report(filename):
    try:
        file = open(filename)
        return file.read()
    except:
        return None