#!/bin/sh

scriptname=$(basename $0)
here=$(dirname $0)

dohelp () {
    cat << DOHELP
${scriptname} --help|-h : this text
${scriptname} : excute 'lessc main.less main.css' in each
                sub directory in which ther is a 'main.less' file
DOHELP
    exit 0
}

if [ $# -ne 0 ]
then
    case $1 in
        --help|-h)
            dohelp
            ;;
        *)
            echo "Bad argument"
            dohelp
            ;;
    esac
fi

for f in $(find $here -name "*.less")
do
    d=$(dirname $f)
    cd $d
    lessname=$(basename $f)
    cssname=$(echo $lessname | sed 's/\(.*\)\.less/\1.css/')
    echo "doing $f / $lessname -> $cssname ..."
    lessc $lessname $cssname
    cd -
done
